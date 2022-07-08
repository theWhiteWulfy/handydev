import classNames from "classnames";
import dynamic from "next/dynamic";
import Head from "next/head";
import { ToastContainer } from "react-toast";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import tools from "../public/tools.json";
import MenuIcon from "../svg/menu.svg";
import { ToolPageSettings, ToolPageSettingSchema } from "../utils/ToolPage";
import Button from "./button";
import styles from "./layout.module.scss";
import Logo from "./logo";
import Shortcut from "./shortcut";
import ToolSettingButton from "./tool-setting-button";

const DarkmodeToggleButton = dynamic(() => import("./darkmode-toggle-button"), {
  ssr: false,
  loading: () => null,
});

export default function Layout<T extends ToolPageSettings>({
  title,
  settings,
  settingSchema,
  updateSetting,
  children,
}: {
  title: string;
  settings: T;
  settingSchema?: ToolPageSettingSchema<T>;
  updateSetting: <K extends keyof T>(id: K, value: T[K]) => void;
  children: ReactNode;
}) {
  const [keyword, setKeyword] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  useHotkeys("/", (e) => {
    e.preventDefault();
    inputRef.current?.focus();
  });

  const { pathname, query, push } = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredTools = keyword
    ? tools
        .map(({ category, tools }) => ({
          category,
          tools: tools.filter((tool) =>
            tool.title.toLowerCase().includes(keyword.toLowerCase())
          ),
        }))
        .filter(({ tools }) => tools.length > 0)
    : tools;

  const links = filteredTools.map(({ category, tools }) => (
    <div
      className={styles.category}
      key={category}
      onClick={() => setKeyword("")}
    >
      {keyword ? null : <h3 className={styles.categoryTitle}>{category}</h3>}
      <div className={styles.categoryTools}>
        {tools.map(({ path, title }) => (
          <Link key={path} href={path} passHref>
            <a
              className={classNames({
                [styles.activeToolLink]: path === pathname,
              })}
            >
              {title}
            </a>
          </Link>
        ))}
      </div>
    </div>
  ));

  useEffect(() => {
    if (typeof document === "undefined") return;
    const counterUsername = process.env.NEXT_PUBLIC_COUNTER_USERNAME;
    if (!counterUsername) return;

    if (
      !sessionStorage.getItem("_swa") &&
      document.referrer.indexOf(location.protocol + "//" + location.host) !== 0
    ) {
      fetch(
        "https://counter.dev/track?" +
          new URLSearchParams({
            referrer: document.referrer,
            screen: screen.width + "x" + screen.height,
            user: counterUsername,
            utcoffset: "8",
          })
      );
    }
    sessionStorage.setItem("_swa", "1");
  });

  const panelVisibility = {
    sidebar: query.sidebar !== "off",
    footer: query.footer !== "off",
  };

  return (
    <div
      className={classNames(styles.container, {
        [styles.sidebar]: panelVisibility.sidebar,
      })}
    >
      <div className={styles.toastContainer}>
        <ToastContainer delay={3000} />
      </div>
      <Head>
        <title>
          {title
            ? `${title} - Handydev Tools`
            : "Handydev Tools - The All-in-One Toolbox for Developers"}
        </title>
        {title && (
          <meta
            name="description"
            content={`${title}. Handydev Tools; the all-in-one toolbox for developers.`}
          />
        )}
        <meta
          name="apple-mobile-web-app-title"
          content={title || "Handydev Tools"}
        />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=7,user-scalable=0,viewport-fit=cover"
        />
      </Head>
      {panelVisibility.sidebar && (
        <aside className={styles.toolSidebar}>
          <div className={styles.logoBar}>
            <Logo link onClick={() => setIsMenuOpen(false)} />
            <div data-lg className={styles.darkModeToggle}>
              <DarkmodeToggleButton />
            </div>
            <div data-sm className={styles.mobileMenu}>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MenuIcon />
              </Button>
            </div>
          </div>
          <div
            className={classNames(styles.searchBar, {
              [styles.isOpen]: isMenuOpen,
            })}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filteredTools.length) {
                  push(filteredTools[0].tools[0].path);
                  setKeyword("");
                }
              }}
            />
            <div className={styles.shortcut} data-lg>
              <Shortcut char="/" />
            </div>
          </div>
          <nav
            data-sm
            className={classNames(styles.toolList, styles.isDropdown, {
              [styles.isOpen]: isMenuOpen,
            })}
            onClick={() => setIsMenuOpen(false)}
          >
            {links}
          </nav>
          <nav data-lg className={styles.toolList}>
            {links}
          </nav>
        </aside>
      )}
      <main className={styles.main}>
        <div className={styles.titleBar}>
          <h1 className={styles.toolTitle}>{title}</h1>
          {settingSchema && (
            <div className={styles.settings}>
              <ToolSettingButton
                settings={settings}
                settingSchema={settingSchema}
                updateSetting={updateSetting}
              />
            </div>
          )}
        </div>
        {children}
        {panelVisibility.footer && (
          <>
            
            <footer className={styles.mainFooter}>
            <blockquote className={styles.blockquote}>
            <ul>
              <li> All editors are resizable, and the size preference will be persisted.</li>
              <li> Press <code>/</code> to focus on the tool search input. Press{" "} <code>Enter</code> to select the first tool. </li>
              <li> Press <code>⌘/CTRL + k</code> to open the setting dropdown if available. </li>
              <li><Link href="/json?sidebar=off">Sidebar off</Link> <Link href="/json?sidebar=off&amp;footer=off">Footer and Sidebar Off</Link> <Link href="/json?line-numbers=off">Line Numbers Off</Link></li>
            </ul>
            </blockquote>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
