import axios from "axios";
import React, { useState } from "react";
import { IconType } from "../assets/Types/Icon";
import IconButton from "../components/IconButton";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function Login() {
	const [form, setForm] = useState<JSX.Element>(
		<LoginForm
			changeForm={() => {
				changeForm(true);
			}}
		/>
	);

	const changeForm = (registerForm: boolean) => {
		if (registerForm) {
			setForm(
				<RegisterForm
					changeForm={() => {
						changeForm(false);
					}}
				/>
			);
		} else {
			setForm(
				<LoginForm
					changeForm={() => {
						changeForm(true);
					}}
				/>
			);
		}
	};

	return <div>{form}</div>;
}
