import { useEffect, useRef } from "react";
import MediaContainer from "./MediaContainer";

export default function SearchResults({
  searchTerm,
  results,
  showResults,
  onLoadMore,
  hasMore,
  page,
  loading,
}) {
  const title = `${results.length} results for ${searchTerm}`;
  const lastItemRef = useRef(null);

  useEffect(() => {
    if (!hasMore) {
      console.log("ei enää sivuja");
      return;
    }

    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("ladataan");
          onLoadMore();
          console.log(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = lastItemRef.current;
    if (lastItemRef.current) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [results, onLoadMore, hasMore, loading]);

  if (!showResults) return null;
  else
    return (
      <div>
        <MediaContainer
          title={title}
          mediaItems={results}
          lastItemRef={lastItemRef}
          loading={loading}
        />
      </div>
    );
}
