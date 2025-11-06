import "./Home.css";
import Navbar from "../components/CardNav";


function Home() {

    //Näiden alle hrefiä muuttamalla saa sivustot määriteltyä
    const items = [
        {
          label: "Movies",
          bgColor: "#212121",
          textColor: "#fff",
          links: [
            { label: "Top Rated", href: "/movies/top-rated", ariaLabel: "Top Rated Movies" },
            { label: "Popular", href: "/movies/popular", ariaLabel: "Popular Movies" },
            { label: "Trending", href: "/movies/trending", ariaLabel: "Trending Movies" }
          ]
        },
        {
          label: "TV Shows", 
          bgColor: "#232323",
          textColor: "#fff",
          links: [
            { label: "Top Rated", href: "/tv-shows/top-rated", ariaLabel: "Top Rated TV Shows" },
            { label: "Popular", href: "/tv-shows/popular", ariaLabel: "Popular TV Shows" },
            { label: "Trending", href: "/tv-shows/trending", ariaLabel: "Trending TV Shows" }
          ]
        },
        {
          label: "Profile & Groups",
          bgColor: "#252525", 
          textColor: "#fff",
          links: [
            { label: "Favorites", href: "/favorites", ariaLabel: "Favorites" },
            { label: "My Groups", href: "/groups", ariaLabel: "My Groups" },
            { label: "Settings", href: "/settings", ariaLabel: "Settings" }
          ]
        }
    ];	
  return (
    <div className="home">
    <Navbar
      logo={"/logo.svg"}
      logoAlt="Logo"
      items={items}
      baseColor="#111111"
      menuColor="#fff"
      buttonBgColor="#212121"
      buttonTextColor="#fff"
      ease="power3.out"
    />
      <main className="home-content">
        <div className="search-container">
          <input type="text" placeholder="Search for movies" className="search-bar" />
        </div>
        <h1>Asd </h1>
        <p>Asd asd asd</p>
      </main>
    </div>
  );
}

export default Home;
