import { useEffect, useState } from "react";

export default function LastModified({ date }: { date: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  
  const when = new Date(date);
  const diff = Math.round((now.getTime() - when.getTime()) / 1000); // seconds

  const format = () => {
    if (diff < 1     ) return "less than a second ago";
    if (diff < 60    ) return "less than a minute ago";
    if (diff < 120   ) return "a minute ago";
    if (diff < 3600  ) return `${Math.round(diff / 60)} minutes ago`;
    if (diff < 7200  ) return "an hour ago";
    if (diff < 86400 ) return `${Math.round(diff / 3600)} hours ago`;
    if (diff < 172800) return "a day ago";
    return `${Math.round(diff / 86400)} days ago`;
  };

  return <span title={when.toLocaleString()}>{format()}</span>;
}