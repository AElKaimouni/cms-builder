import { useEffect, useRef, useState } from "react";
import { useMainContext } from "../states";
import { Router } from "next/router";

export const  useLoader = () => {
  const [pers, setPrs] =  useState<number>(0);
  const ref = useRef<HTMLElement>();
    
  useEffect(() => {
      document.body.classList.remove("page-loaded");
      const counting = window.setInterval(() => {
          setPrs(pers => {
              const width = 99 - pers;
              if(pers === 99) {
                  window.clearInterval(counting);
                  document.body.classList.add("page-loaded")
              }
  
              const loader = ref.current;
              loader.style.transition = "none";
              if(loader instanceof HTMLElement) {
                  loader.style.width = width + "%";
              }
              return pers + 1;
          });
      }, 10);

    return () =>  clearInterval(counting);
  }, []);

  return {pers, ref};
}

export function getNextWeekDate() {
  const today = new Date();
  const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  return nextWeek.toDateString();
}

export function getPlatformIcon(platform: string) {
  switch(platform) {
    case "facebook": return "fab fa-facebook-f";
    case "twitter": return "fab fa-twitter";
    case "linkedin": return "fab fa-linkedin-in";
    default: return platform;
  }
}

export function extractSrcWithRegExp(iframeHTML) {
  // Regular expression to match the src attribute value
  var srcRegex = /<iframe[^>]*\ssrc="([^"]*)"[^>]*>/i;

  // Match the src attribute using the regex
  var match = iframeHTML.match(srcRegex);

  // Check if a match is found and return the src attribute value
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

export const validateMailForm = (body: any) => {
  const { f_name, l_name, objective, email, phone, message } = body;

  if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return null;
  if(!message) return null;
  if(message.length < 4) return false;

  return { f_name, l_name, objective, email, phone, message };
}

function validateLinkedInProfile(url) {
  // Define the regular expression for a valid LinkedIn profile URL
  const regex = /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub|company)\/[a-zA-Z0-9-]+\/?$/;

  // Test the URL against the regular expression
  return regex.test(url);
}

export const validateCommentForm = (body: any) => {
  const { blog_id, name, email, description, linkedin } = body;

  if(typeof blog_id !== "string") return "";
  if(!validateLinkedInProfile(linkedin)) return "invalid LinkedIn profile URL. Please ensure the URL is in the format 'https://www.linkedin.com/in/username' or similar."
  if(typeof name !== "string" || name.length < 4) return "please enter a valid full name";
  if(typeof description !== "string" || description.length < 4) return "please enter a valid comment";
  if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return "please enter a valid email";

  return { blog_id, name, email, description, linkedin };
}

export const codeBlockLangs = [
  "bash",
  "c",
  "clojure",
  "cpp",
  "csharp",
  "dart",
  "elixir",
  "elm",
  "erlang",
  "fsharp",
  "graphql",
  "go",
  "groovy",
  "haskell",
  "html",
  "java",
  "javascript",
  "jsx",
  "julia",
  "kotlin",
  "lisp",
  "makefile",
  "matlab",
  "objectivec",
  "ocaml",
  "php",
  "python",
  "r",
  "ruby",
  "rust",
  "scala",
  "sql",
  "swift",
  "tsx",
  "typescript"
]