import searchIcon from "@/assets/icons/search.svg";
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
              animateLoading(containerRef.current, 3, () => {
                navigate(`/@${searchQuery}`);
              });
            }
            break;
          }
          case "1": {
            if (!e.ctrlKey) return;
            setSearchQuery(recent[0] || searchQuery);
            selectAfterPaint();
            break;
          }
          case "2": {
            if (!e.ctrlKey) return;
            setSearchQuery(recent[1] || searchQuery);
            selectAfterPaint();
            break;
          }
          case "3": {
            if (!e.ctrlKey) return;
            setSearchQuery(recent[2] || searchQuery);
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
      setRecent(parsed);
    }
  }, []);

  return (
    <main>
      <section className="search-container">
        <div className="search" ref={containerRef}>
          <div className="searchbox-wrapper">
            <div className="searchbox">
              <img className="search-icon" src={searchIcon} alt="search icon" />
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
            </div>
            <ul>
              {recent.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Searchbar;
