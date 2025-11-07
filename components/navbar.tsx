import {
    Navbar as HeroUINavbar,
    NavbarContent,
    NavbarItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { GithubIcon } from "@/components/ui/icons";

export const Navbar = () => {

    return (
        <HeroUINavbar maxWidth="xl" position="sticky">
            <NavbarContent className="basis-full" justify="start">
                <span className="font-bold text-3xl">ChatBot IA 🤖</span>
            </NavbarContent>

            <NavbarContent className="flex basis-full" justify="end">
                <NavbarItem className="flex gap-2">
                    <Link isExternal aria-label="Github" href={siteConfig.links.github}>
                        <GithubIcon className="text-default-500" />
                    </Link>
                    <ThemeSwitch />
                </NavbarItem>
            </NavbarContent>
        </HeroUINavbar>
    );
};
