import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export type Message = {
    role: "user" | "assistant";
    content: string;
};