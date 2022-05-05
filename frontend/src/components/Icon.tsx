import React, { SVGProps, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { IconType } from "../assets/Types/Icon";
import { ReactComponent as Close } from "../assets/icons/close.svg";
import { ReactComponent as HamburgerMenu } from "../assets/icons/hamburgerMenu.svg";
import { ReactComponent as KebabMenu } from "../assets/icons/kebabMenu.svg";
import { ReactComponent as Login } from "../assets/icons/login.svg";
import { ReactComponent as Logout } from "../assets/icons/logout.svg";
import { ReactComponent as NewAccount } from "../assets/icons/newAccount.svg";
import { ReactComponent as RemoveAccount } from "../assets/icons/removeAccount.svg";
import { ReactComponent as Tick } from "../assets/icons/tick.svg";
import { isPropertyAssignment } from "typescript";

function Icon(props: Props) {
	let test = <Close />;
	const [icon, setIcon] = useState<typeof test>();

	useEffect(() => {
		switch (props.icon) {
			case IconType.close:
				setIcon(<Close fill={props.color} width={props.size} height={props.size} />);
				break;
			case IconType.hamburgerMenu:
				setIcon(
					<HamburgerMenu fill={props.color} width={props.size} height={props.size} />
				);
				break;
			case IconType.kebabMenu:
				setIcon(<KebabMenu fill={props.color} width={props.size} height={props.size} />);
				break;
			case IconType.login:
				setIcon(<Login fill={props.color} width={props.size} height={props.size} />);
				break;
			case IconType.logout:
				setIcon(<Logout fill={props.color} width={props.size} height={props.size} />);
				break;
			case IconType.newAccount:
				setIcon(<NewAccount fill={props.color} width={props.size} height={props.size} />);
				break;
			case IconType.removeAccount:
				setIcon(
					<RemoveAccount fill={props.color} width={props.size} height={props.size} />
				);
				break;
			case IconType.tick:
				setIcon(<Tick fill={props.color} width={props.size} height={props.size} />);
				break;
		}
	}, [props.icon, props.size, props.color]);
	return <div>{icon}</div>;
}

interface Props {
	icon: IconType;
	size: number;
	color: string;
}

Icon.propTypes = {
	icon: PropTypes.oneOf(Object.values(IconType) as IconType[]).isRequired,
	size: PropTypes.number.isRequired,
	color: PropTypes.string.isRequired,
};

export default Icon;
