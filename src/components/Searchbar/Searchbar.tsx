import es from "@/assets/es.png";
import searchIcon from "@/assets/icons/search.svg";
import love from "@/assets/love.png";
import { clipsByVodQuery } from "@/lib/api/clips";
import { lastVodByStreamerQuery, vodByVidQuery } from "@/lib/api/vods";
import { isRecentSearches, wrapVodWithVODResponse } from "@/lib/utils";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LSKEY_RECENT_SEARCHES } from "../Timeline/constants";
import "./Searchbar.scss";

const prefetchResults = async (client: QueryClient, query: string) => {
  const resp = await client.fetchQuery(lastVodByStreamerQuery(query));
  const vod = resp.data.vods[0];
  if (!vod) {
    return;
  }
  // cache also for vod id
  client.setQueryData(
    vodByVidQuery(vod.id).queryKey,
    wrapVodWithVODResponse(vod)
  );

  // prefetch and cache. we don't care about results in this component, that's
  // up to the Timeline (single source of truth for fetch errors)
  await client.prefetchQuery(clipsByVodQuery(vod));
};

const loadingClassname = "loading";
const animateLoading = (
  el: HTMLDivElement | null,
  sec: number,
  cb: () => void
) => {
  if (!el) return;
  el.style.setProperty("--loading-duration", `${sec}s`);
  el.classList.add(loadingClassname);
  setTimeout(() => {
    cb();
  }, sec * 1000);
};

const Searchbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const updateSearchQuery = useCallback(() => {
    if (inputRef.current?.value !== undefined) {
      setSearchQuery(inputRef.current.value);
    }
  }, []);

  const selectInputValue = useCallback(() => {
    inputRef.current?.select();
  }, []);

  const selectAfterPaint = useCallback(
    () => requestAnimationFrame(selectInputValue),
    [selectInputValue]
  );

  const client = useQueryClient();
  useEffect(
    function setupKeybindings() {
      const handleKey = (e: KeyboardEvent) => {
        switch (e.key) {
          case "Enter": {
            if (searchQuery !== "") {
              // start prefetching, we will asynchronously start the transition
              prefetchResults(client, searchQuery);
              footerRef.current?.classList.add("hide");
              animateLoading(containerRef.current, 3, () => {
                navigate(`/@${searchQuery}`);
              });
            }
            break;
          }
          case "1": {
            if (!e.ctrlKey) return;
            setSearchQuery(recent?.[0] || searchQuery);
            selectAfterPaint();
            break;
          }
          case "2": {
            if (!e.ctrlKey) return;
            setSearchQuery(recent?.[1] || searchQuery);
            selectAfterPaint();
            break;
          }
          case "3": {
            if (!e.ctrlKey) return;
            setSearchQuery(recent?.[2] || searchQuery);
            selectAfterPaint();
            break;
          }
          case "/": {
            e.preventDefault();
            inputRef.current?.focus();
            selectAfterPaint();
            break;
          }
        }
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    },
    [searchQuery, recent, selectInputValue, selectAfterPaint, navigate, client]
  );

  useEffect(function getRecentSearches() {
    const val = localStorage.getItem(LSKEY_RECENT_SEARCHES);
    if (val) {
      const parsed = JSON.parse(val);
      if (!isRecentSearches(parsed)) {
        return;
      }
      setRecent(parsed.reverse());
    }
  }, []);

  useEffect(function hideNavbar() {
    const nav = document.querySelector(".navbar") as HTMLElement | null;
    if (nav) {
      nav.classList.remove("active");
    }
  }, []);

  useEffect(function showFooter() {
    footerRef.current?.classList.remove("hide");
  }, []);

  return (
    <>
      <main>
        <section className="search-container">
          <div className="search" ref={containerRef}>
            <div className="searchbox-wrapper">
              <div className="searchbox">
                <img
                  className="search-icon"
                  src={searchIcon}
                  alt="search icon"
                />
                <input
                  type="text"
                  tabIndex={0}
                  autoFocus={true}
                  spellCheck={false}
                  placeholder="Search for a channel..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  onChange={updateSearchQuery}
                  onFocus={selectInputValue}
                  value={searchQuery}
                  ref={inputRef}
                />
                <span className="key-hint">[ ENTER ]</span>
              </div>

              {recent.length > 0 && (
                <div className="recent">
                  <div className="recent-title">
                    <small>Recent</small>
                    <span className="divider">|</span>
                    <span className="key-hint">CTRL + #</span>
                  </div>
                  <ul className="recent-list">
                    {recent.map((r, i) => (
                      <li key={r} onClick={() => setSearchQuery(r)}>
                        <span>{i + 1}</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer ref={footerRef}>
        <div className="footer-notice">
          <p>
            Rcap.tv is not affiliated with Twitch or Amazon. All Trademarks and
            logos are the property of their respective owners.
          </p>
        </div>
        <div className="footer-about">
          <span className="made-0">•</span>
          <p className="made-1">Made</p>
          <p className="made-2">with</p>
          <img className="love" src={love} alt="peepo love" />
          <p className="made-3">in</p>
          <img className="flag made-4" src={es} alt="spain flag" />
          <span className="made-5">•</span>
        </div>
      </footer>
    </>
  );
};

export default Searchbar;
