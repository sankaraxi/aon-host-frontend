import {useState} from "react";
import './systemcheck.css';
import EnvironmentSetup from './EnvironmentSetup.png';
import configuration from './configuration.png';
import ribbon from './ribbon.png';
import guide from './guide_18823709.png';
import GuidelinesSideBarWithoutHead from './GuidelinesSideBarWithoutHead';
import { useEffect } from "react";
import axios from "axios";

import { useLocation, useNavigate } from "react-router-dom"
import { enterFullscreen } from '../utils/useAssessmentProtection';
import { useTabClaim } from '../utils/useTabClaim';

export default function GuidelinesPage() {

  const location = useLocation();
  const navigate = useNavigate();

  const [payload, setPayload] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [tabBlocked, setTabBlocked] = useState(false);
  const [activeTabId, setActiveTabId] = useState(null);
  const [activeTokenId, setActiveTokenId] = useState(null);


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

        // Check if the user has already submitted the assessment
        if (data.payload.submitted === 1) {
          setAlreadySubmitted(true);
          return;
        }

        // Store the launch token so we can restore session on reload
        sessionStorage.setItem("launchToken", token);
        sessionStorage.setItem("launchTokenId", data?.payload?.id);

        sessionStorage.setItem("dockerPort", data?.payload?.docker_port);
        sessionStorage.setItem("outputPort", data?.payload?.output_port);

        sessionStorage.setItem("userRole", 4);
        sessionStorage.setItem("userId", data?.payload?.id);
        sessionStorage.setItem("userQues", data?.payload?.question_id);
        sessionStorage.setItem("aonId", data?.payload?.aon_id);
        if (data?.payload?.redirect_url) {
          sessionStorage.setItem("redirectUrl", data.payload.redirect_url);
        } else {
          sessionStorage.removeItem("redirectUrl");
        }

        // ── Single-tab enforcement ──────────────────────────────────────
        // Generate a stable tabId for this browser tab (survives in-tab
        // refreshes via sessionStorage, but NOT shared across tabs).
        let localTabId = sessionStorage.getItem('assessmentTabId');
        if (!localTabId) {
          localTabId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2) + Date.now().toString(36);
          sessionStorage.setItem('assessmentTabId', localTabId);
        }

        try {
          const claimRes = await axios.post(
            `${import.meta.env.VITE_BACKEND_API_URL}/aon/claim-tab`,
            { launchTokenId: data.payload.id, tabId: localTabId }
          );
          if (claimRes.data.status === 'blocked') {
            setTabBlocked(true);
            return;
          }
          // 'allowed' or 'submitted' — proceed; submitted is handled below
        } catch (claimErr) {
          // Fail-open: if the endpoint is unreachable, allow access
          console.warn('Tab claim check failed, proceeding:', claimErr.message);
        }

        setActiveTabId(localTabId);
        setActiveTokenId(data.payload.id);
        // ────────────────────────────────────────────────────────────────

        // Check if assessment was already started - redirect to workspace
        if (data.payload.assessment_started === 1 && data.payload.workspace_url) {
          console.log("Assessment already started, redirecting to workspace:", data.payload.workspace_url);
          
          // Also restore the framework if available
          if (data.payload.framework) {
            sessionStorage.setItem("framework", data.payload.framework);
          }
          
          // Redirect to the saved workspace URL
          window.location.href = data.payload.workspace_url;
          return;
        }


        // optional redirect
        // navigate("/assessment", { replace: true });

      } catch (err) {
        console.error("Token resolve failed:", err);
      }
    };

    resolveToken();
  }, [location.search, navigate]);


  // Heartbeat: keep the single-tab lock alive while this tab is open
  useTabClaim({
    launchTokenId: activeTokenId,
    tabId: activeTabId,
    enabled: Boolean(activeTokenId && activeTabId),
    onEvicted: () => setTabBlocked(true),
  });

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

  // Show "already submitted" screen if the user has already completed the assessment
  if (alreadySubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="max-w-lg mx-auto p-10 bg-white shadow-lg rounded-xl text-center">
          <div className="mb-6">
            <svg className="mx-auto h-20 w-20 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Assessment Already Submitted</h1>
          <p className="text-gray-600 text-lg">
            You have already completed and submitted the assessment. 
          </p>
          <p className="text-gray-500 mt-2">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Show blocked screen when another tab already has this assessment open
  if (tabBlocked) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="max-w-lg mx-auto p-10 bg-white shadow-lg rounded-xl text-center">
          <div className="mb-6">
            <svg className="mx-auto h-20 w-20 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Active Session Detected</h1>
          <p className="text-gray-600 text-lg">
            This assessment is already open in another tab or window.
          </p>
          <p className="text-gray-500 mt-2">
            Please close the other tab or window and try again. If you have already closed it, wait a few seconds and then refresh this page.
          </p>
        </div>
      </div>
    );
  }

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
            <GuidelinesSideBarWithoutHead />
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
            <button 
              onClick={async () => {
                try {
                  await enterFullscreen();
                } catch (e) {
                  console.error('Failed to enter fullscreen:', e);
                }
                sessionStorage.setItem('assessmentFullscreen', 'true');
                sessionStorage.setItem('tabSwitchCount', '0');
                navigate(`/question/${base64}`);
              }}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-md shadow hover:bg-green-700 transition duration-200"
            >
              Start Assessment
            </button>
        </div>
        
      </div>

    </>
    
  );
  
}