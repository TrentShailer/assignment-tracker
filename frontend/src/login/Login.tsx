import axios from "axios";
import React, { useState } from "react";
import { IconType } from "../assets/Types/Icon";
import IconButton from "../components/IconButton";

export default function Login() {
	const [errorText, setErrorText] = useState<string>("");

	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(e.target.value);
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const onSubmit = () => {
		setErrorText("");
		if (username.match(/[^a-zA-Z0-9\-_\.]/) || username.length === 0) {
			setErrorText("Invalid username.");
			return;
		}
		if (password.length === 0) {
			setErrorText("Invalid password.");
			return;
		}
		axios
			.post("http://localhost:2005/login", { username: username, password: password })
			.then((response) => {
				let result: any = response.data;
				if (result.success) {
					window.location.href = "/home";
				} else {
					setErrorText("Username or password are incorrect.");
				}
			})
			.catch((response) => {
				console.log(response);
			});
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
			<div className="glassCard" style={{ width: "clamp(0px, 600px, 80vw)" }}>
				<div style={{ color: "#fff", fontSize: 36 }}>Login</div>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<input placeholder="Username" onChange={handleUsernameChange} />
					<input type="password" placeholder="Password" onChange={handlePasswordChange} />
				</div>
				<div style={{ color: "#F44336", fontSize: 18, marginTop: 10 }}>{errorText}</div>
				<div
					style={{
						width: "100%",
						display: "flex",
						justifyContent: "space-between",
						marginTop: 20,
					}}>
					<IconButton
						icon={IconType.newAccount}
						color={"#03a9f4"}
						size={48}
						onClick={() => {}}
					/>
					<IconButton
						icon={IconType.login}
						color={"#4caf50"}
						size={48}
						onClick={onSubmit}
					/>
				</div>
			</div>
		</div>
	);
}
