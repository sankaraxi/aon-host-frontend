import {useState} from "react";
import { Link } from "react-router-dom";
import './systemcheck.css';
import EnvironmentSetup from './EnvironmentSetup.png';
import configuration from './configuration.png';
import ribbon from './ribbon.png';
import guide from './guide_18823709.png';
import { useEffect } from "react";
import axios from "axios";

import { useLocation, useNavigate } from "react-router-dom"


export default function GuidelinesPage() {

  const location = useLocation();
  const navigate = useNavigate();

  const [payload, setPayload] = useState(null);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("t");

    if (!token) {
      navigate("/invalid-link", { replace: true });
      return;
    }

    const resolveToken = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/aon/resolve`, {
          params: { t: token },
          withCredentials: true // safe if you move to httpOnly cookies later
        });

        const data = res.data;

        // console.log("Token resolve response:", data);

        if (!data.success) {
          console.error("Token resolve unsuccessful:", data.message);
          return;
        }

        // store in React memory only (cleanest)
        setPayload(data.payload);

        sessionStorage.setItem("dockerPort", data?.payload?.docker_port);
        sessionStorage.setItem("outputPort", data?.payload?.output_port);

        sessionStorage.setItem("userRole", 4);
        sessionStorage.setItem("userId", data?.payload?.id);
        sessionStorage.setItem("userQues", data?.payload?.question_id);
        sessionStorage.setItem("aonId", data?.payload?.aon_id);


        // optional redirect
        // navigate("/assessment", { replace: true });

      } catch (err) {
        console.error("Token resolve failed:", err);
      }
    };

    resolveToken();
  }, [location.search, navigate]);


  // console.log('payload', payload);
  // console.log('payload id', payload?.id);


    const paramData = {
      id: payload?.id,
      session_id: payload?.session_id,
      aon_id: payload?.aon_id,
      question_id: payload?.question_id,
      dockerPort: payload?.docker_port,
      outputPort: payload?.output_port,
      test_id: payload?.test_id,
      test_name: payload?.test_name,
    }
  
    const base64 = btoa(JSON.stringify(paramData)); 

  return (
    <>

      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6 headingcolor">
          Candidate Instructions – Front-End Assessment (Pre-Test Notes)
        </h1>

        <p className="text-gray-700 mb-6">
          Welcome! Before you begin your front-end assessment, please take a moment to read these instructions carefully. This will help you make the best use of your time and the embedded coding environment.
        </p>

        <section className="mb-6">
          <div className="shadow-md p-4 mb-4 animation">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 headingcolor">
              <img src={EnvironmentSetup} alt="Environment Icon" className="w-8 h-8 inline-block" /> Environment Setup
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>You will be working in a browser-based VS Code environment (codeserver).</li>
              <li>The project is preconfigured with two frameworks: React and Vue.js.</li>
              <li>You may choose either React or Vue.js for this task — select the one you are most comfortable with.</li>
              <li>For styling, use the shared stylesheet: <code>App.css</code>.</li>
            </ul>
          </div>
          <div className="shadow-md p-4 animation">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 headingcolor">
              <img src={configuration} alt="configuration Icon" className="w-8 h-8 inline-block" /> Configuration Setup
            </h2>
            <p className="text-gray-700 mb-2">Before starting the development:</p>
            <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
              <li><strong>Step 1:</strong> Open the terminal and install the required npm modules.</li>
              <div>
                <img src="/npminstall.png" className="animation" alt="npm install" />
              </div>
              <li><strong>Step 2:</strong> Type the Command to run the react/vue application</li>
              <div>
                <img src="/npmrundev.png" className="animation" alt="npm run dev" />
              </div>
              <li><strong>Step 3:</strong> Check the App.js (for React) or App.vue (for Vue) file to understand the structure and the class names used.</li>
              <li>Based on those class names, create appropriate styles in the <code>App.css</code></li>
              <li>Also, review the <code>index.html</code> file located in the project folder to ensure that your layout aligns with any HTML structure-related test cases. This helps you meet all DOM and layout requirements during validation.</li>
              <li><strong>Step 4:</strong> Click the <code>Output</code> button to view your output.</li>
              <strong>You click on the <code>Guidelines</code> button in the assessment page if you have any queries.</strong>
            </ul>
          </div>
        </section>

        <section className="mb-6 shadow-md p-4 animation">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 headingcolor">
            <img src={ribbon} alt="ribbon Icon" className="w-8 h-8 inline-block" /> Submission Guidelines
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Once you complete the task, save all changes.</li>
            <li>Press the "Submit Assessment" button to run validation.</li>
            <li>You can submit the code multiple times within the 30-minute time limit to check your results.</li>
            <li>Your final submission before the deadline will be considered for evaluation.</li>
          </ul>
        </section>

        <section className="mb-8 shadow-md p-4 animation">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 headingcolor">
            <img src={guide} alt="Enviroguidenment Icon" className="w-8 h-8 inline-block" /> General Guidelines
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Use only the provided libraries (React or Vue). Do not install third-party libraries like Bootstrap or Tailwind.</li>
            <li>Follow clean coding practices — use meaningful class names, maintain indentation, and add comments where needed.</li>
            <li>Ensure your layout is responsive and follows the grid structure as specified in the task.</li>
          </ul>
          <p className="mt-4 text-center text-gray-700 text-success text-bold">
            All the best — build something neat and clean.
          </p>
        </section>

        <div className="mt-4">
        <Link to={`/question/${base64}`}>
            <button className="w-full bg-green-600 text-white py-3 px-6 rounded-md shadow hover:bg-green-700 transition duration-200">
              Start Assessment
            </button>
          </Link>
        </div>
      </div>

    </>
    
  );
  
}