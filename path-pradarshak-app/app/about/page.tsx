"use client";

import { useEffect } from "react";
import HomepageNavigation from "@/components/HomepageNavigation";

const sections = [
  {
    title: "Our Mission",
    text: `CivicSync empowers citizens to report civic issues, track resolutions, and build smarter communities.
We believe that transparent communication between citizens and municipal staff creates better, more responsive cities for everyone.`,
    imgSrc: "https://www.tribuneindia.com/sortd-service/imaginary/v22-01/jpg/large/high?url=dGhldHJpYnVuZS1zb3J0ZC1wcm8tcHJvZC1zb3J0ZC9tZWRpYWQ4NDZhNGQwLTlmZGEtMTFlZi04YTBkLWIzMzdmNjgxZjg3My5qcGc=&utm_source=chatgpt.com",
    imgAlt: "Our Mission Illustration",
  },
  {
    title: "Why We Exist",
    text: `Civic issues often go unresolved due to lack of accountability. CivicSync bridges this gap by connecting citizens and municipal staff transparently.
Our platform ensures that every reported issue gets proper attention and resolution tracking.`,
    imgSrc: "about02.jpeg",
    imgAlt: "Civic Engagement Illustration",
  },
  {
    title: "How It Works",
    text: `CivicSync makes civic issue reporting simple and transparent. Citizens report issues with photos and location, staff acknowledge and update progress,
and everyone can track the resolution process from start to finish.`,
    imgSrc: "about03.avif",
    imgAlt: "How It Works Illustration",
    list: [
      "Report an issue with photo+location",
      "Staff acknowledge & update progress",
      "Citizens track until resolution",
      "Admins generate transparent reports",
    ],
  },
];

const sectionStyles = [
  { padding: "2rem", marginBottom: "4rem" },  // Our Mission
  { padding: "3rem", marginBottom: "2rem" },  // Why We Exist
  { padding: "1.5rem", marginBottom: "3rem" } // How It Works
];

export default function AboutPage() {
	// Set page title
	useEffect(() => {
		document.title = 'About – CivicSync'
	}, [])
	
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Public Navigation */}
			<HomepageNavigation />
      <main className="py-16 px-6 text-gray-800 pt-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <h1 className="text-4xl mt-20 font-extrabold text-blue-700 text-center mb-8">
          About CivicSync
        </h1>
        <p className="text-lg text-center max-w-3xl mx-auto mb-16">
          Empowering communities through transparent civic issue reporting and resolution.
        </p>

        {sections.map(({ title, text, imgSrc, imgAlt, list }, idx) => (
          <div
            key={title}
            className={`flex flex-col md:flex-row items-center gap-8 ${
              idx % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
            style={sectionStyles[idx]}
          >
            <div className="flex-shrink-0 w-full md:w-1/2 max-w-md rounded-lg overflow-hidden shadow-lg ring-1 ring-gray-300">
              <img
                src={imgSrc}
                alt={imgAlt}
                className="w-full object-cover"
                style={
                  idx === 0
                    ? { height: "260px" }
                    : idx === 1
                    ? { height: "245px" }
                    : { height: "320px" }
                }
              />
            </div>
            <div className="md:w-1/2 bg-white rounded-xl shadow-md p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-semibold mb-4 border-l-4 border-blue-600 pl-4">
                {title}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{text}</p>
              {list && (
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}

        <blockquote className="max-w-3xl mx-auto italic border-l-4 border-blue-600 pl-6 text-gray-600">
          "Strong communities are built when citizens and governments work together transparently." – CivicSync Team
        </blockquote>

        <div className="text-center mt-12">
          <a
            href="/auth/signup"
            className="inline-block bg-blue-600 text-white font-semibold px-10 py-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition shadow-md"
          >
            Report an Issue Now
          </a>
        </div>
      </div>
      </main>
    </div>
  );
}
