import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import IconButton from "../components/IconButton";
import { IconType } from "../assets/Types/Icon";

interface IProps {
	changeForm: Function;
}

interface IValidity {
	valid: boolean;
	reason?: string;
}

function IsUsernameValid(username: string | undefined): IValidity {
	let validity: IValidity = { valid: true };

	if (!username || username === "") {
		validity = { valid: false, reason: "You must enter a username." };
		return validity;
	}

	if (username.length < 6) {
		validity = { valid: false, reason: "Username must be at least 6 characters long." };
		return validity;
	}

	if (username.length > 32) {
		validity = { valid: false, reason: "Username must be at most 32 characters long." };
		return validity;
	}

	if (username.match(/[^a-zA-Z0-9\`\~\!\@\#\$\%\^\&\*\-\_\=\+\ ]/)) {
		validity = {
			valid: false,
			reason: "Username may only contain letters, numbers, and certain special characters.",
		};
		return validity;
	}

	return validity;
}

function IsPasswordValid(password: string | undefined): IValidity {
	let validity: IValidity = { valid: true };

	if (!password || password === "") {
		validity = { valid: false, reason: "You must enter a password." };
		return validity;
	}

	if (password.length < 12) {
		validity = { valid: false, reason: "Password must be at least 12 characters long." };
		return validity;
	}

	if (password.length > 32) {
		validity = { valid: false, reason: "Password must be at most 32 characters long." };
		return validity;
	}

	if (password.match(/[^a-zA-Z0-9\`\~\!\@\#\$\%\^\&\*\-\_\=\+\ ]/)) {
		validity = {
			valid: false,
			reason: "Password may only contain letters, numbers, and certain special characters.",
		};
		return validity;
	}

	return validity;
}

function RegisterForm(props: IProps) {
	const [errorText, setErrorText] = useState<string>("");

	const [opacity, setOpacity] = useState<number>(0);

	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	useEffect(() => {
		setTimeout(() => {
			setOpacity(1);
		}, 200);
	}, []);

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(e.target.value);
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorText("");

		let validUsername = IsUsernameValid(username);
		let validPassword = IsPasswordValid(password);

		if (!validUsername.valid) {
			if (validUsername.reason) setErrorText(validUsername.reason);
			return;
		}

		if (!validPassword.valid) {
			if (validPassword.reason) setErrorText(validPassword.reason);
			return;
		}

		axios
			.post("http://localhost:2005/register", { username: username, password: password })
			.then((response) => {
				let result: any = response.data;
				if (result.success) {
					window.location.href = "/home";
				} else {
					setErrorText(result.message);
				}
			})
			.catch((response) => {
				setErrorText("Something went wrong, please try again later.");
			});
	};

	const ChangeForm = () => {
		setOpacity(0);
		setTimeout(() => {
			props.changeForm();
		}, 350);
	};

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}>
			<div
				className="glassCard"
				style={{
					width: "clamp(0px, 600px, 80vw)",
					opacity: opacity,
					transition: "opacity 350ms ease-in-out",
				}}>
				<div style={{ color: "#fff", fontSize: 36 }}>Register</div>
				<form onSubmit={onSubmit}>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<input placeholder="Username" onChange={handleUsernameChange} />
						<input
							type="password"
							placeholder="Password"
							onChange={handlePasswordChange}
						/>
						<input type="submit" style={{ display: "none" }} />
					</div>
				</form>
				<div style={{ color: "#F44336", fontSize: 18, marginTop: 10 }}>{errorText}</div>
				<div
					style={{
						width: "100%",
						display: "flex",
						justifyContent: "flex-end",
						marginTop: 20,
						gap: 10,
					}}>
					<IconButton
						icon={IconType.close}
						color={"#757575"}
						size={48}
						onClick={ChangeForm}
					/>
					<IconButton
						icon={IconType.newAccount}
						color={"#03a9f4"}
						size={48}
						onClick={onSubmit}
					/>
				</div>
			</div>
		</div>
	);
}

RegisterForm.propTypes = {
	changeForm: PropTypes.func.isRequired,
};

export default RegisterForm;
