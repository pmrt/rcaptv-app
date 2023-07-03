import { colorize } from "@/lib/colorize";
import Searchbar from "./Searchbar";

import "./Navbar.scss";

export default function Navbar() {
  const v = [
    24, 21, 40, 32, 50, 110, 63, 52, 30, 500, 1200, 3200, 8000, 120000,
  ];
  const colorInterp = colorize([255, 208, 96], [255, 96, 141], v);
  return (
    <nav>
      {v.map((v, i) => {
        const rgb = colorInterp(i);
        return (
          <div
            key={v}
            className="card"
            style={{ backgroundColor: `rgb(${rgb.join(",")})` }}
          >
            {v}
          </div>
        );
      })}
      <Searchbar />
    </nav>
  );
}
