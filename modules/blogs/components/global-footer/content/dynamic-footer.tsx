"use client";
import { useContext, useEffect } from "react";
import {
  FooterContext,
  SocialLink,
  FooterColumn,
} from "../context/footer-context";
import Image from "next/image";
import { Dribbble, Link, Mail, Instagram, Twitter, Github } from "lucide-react";
import { ReactNode } from "react";

const getSocialIcon = (url: string): ReactNode => {
  if (url.includes("dribbble.com")) return <Dribbble className="h-5 w-5" />;
  if (url.includes("instagram.com")) return <Instagram className="h-5 w-5" />;
  if (url.includes("twitter.com")) return <Twitter className="h-5 w-5" />;
  if (url.includes("github.com")) return <Github className="h-5 w-5" />;
  if (url.startsWith("mailto:")) return <Mail className="h-5 w-5" />;
  return <Link className="h-5 w-5" />;
};

export default function DynamicFooter() {
  const {
    theme,
    footerStyle,
    logoUrls,
    logoUrl,
    description,
    socialLinks,
    footerColumns,
    footnote,
  } = useContext(FooterContext);

  const isDarkMode = theme === "dark";
  const footerContainerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode
      ? footerStyle.backgroundColorDark
      : footerStyle.backgroundColorLight,
    color: isDarkMode ? footerStyle.textColorDark : footerStyle.textColorLight,
    borderTop: `${footerStyle.borderWidth}px solid ${footerStyle.borderColor}`,
  };

  const sortedColumns = [...footerColumns].sort((a, b) => a.order - b.order);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    }
  }, [theme]);

  return (
    <footer style={footerContainerStyle} className="w-full">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-4">
            {logoUrls[theme] && (
              <a href={logoUrl} target="_blank" rel="noopener noreferrer">
                <Image
                  src={logoUrls[theme]}
                  alt="logo"
                  width={120}
                  height={40}
                  className="object-contain h-8 w-auto"
                />
              </a>
            )}
            {description && (
              <p className="text-sm max-w-[300px]" style={{ opacity: 0.8 }}>
                {description}
              </p>
            )}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                >
                  {getSocialIcon(social.link)}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {sortedColumns.map((column) => (
              <div key={column.id}>
                <h3 className="font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {[...column.links]
                    .sort((a, b) => a.order - b.order)
                    .map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.link}
                          target={link.openInNewTab ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className="text-sm transition-opacity hover:opacity-70"
                          style={{ opacity: 0.8 }}
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {footnote && (
          <div
            className="mt-12 pt-8 border-t"
            style={{ borderColor: "rgba(128, 128, 128, 0.2)" }}
          >
            <p className="text-center text-sm" style={{ opacity: 0.6 }}>
              {footnote}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
