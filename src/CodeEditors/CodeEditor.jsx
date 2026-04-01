import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CodeEditor() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const userRole = sessionStorage.getItem("userRole");

    const {id , framework,dPort, oPort} = useParams();

    console.log("ID:", id);
    console.log("Framework:", framework);

    // const userId = sessionStorage.getItem("userId");


    // const dockerPort = sessionStorage.getItem("dockerPort");
    // var outputPort = sessionStorage.getItem("outputPort");

    // const dockerVuePort = Number(sessionStorage.getItem("dockerPort")) + 1;

    // if (framework === "vue"){
    //    outputPort = Number(sessionStorage.getItem("outputPort")) + 1;
    // }

    // console.log(dockerPort,dockerVuePort, outputPort, framework);

    const navigate = useNavigate();
    const iframeRef = useRef(null);

  // console.log(userRole);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const injectScript = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const script = iframeDoc.createElement('script');
          script.textContent = `
            document.addEventListener('paste', (e) => {
              e.preventDefault();
              alert('Pasting is disabled for this assessment.');
            });
            document.addEventListener('copy', (e) => {
              e.preventDefault();
              alert('Copying is disabled for this assessment.');
            });
          `;
          iframeDoc.head.appendChild(script);
        } catch (e) {
          console.error('Failed to inject script into iframe:', e);
        }
      };
      iframe.addEventListener('load', injectScript);
      return () => iframe.removeEventListener('load', injectScript);
    }
  }, []);

  useEffect(() => {
    const userRole = sessionStorage.getItem("userRole");
    const launchToken = sessionStorage.getItem("launchToken");

    // console.log("User role:", userRole);

    if (["4", "3", "5"].includes(userRole)) {
      setIsAuthorized(true); // Let them through
    } else if (launchToken) {
      // Session lost but we have the token - redirect to restore session
      navigate(`/aon/start?t=${launchToken}`, { replace: true });
    } else {
      navigate("/"); // Kick 'em out
    }
  }, [navigate]);

  // Lock body scroll so there is no white space below the editor in fullscreen
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

function renderContent() {
  const outputSrc = framework === "react"
    ? `${import.meta.env.VITE_DOCKER_OUTPUT_PORT}${oPort}`
    : framework === "vue"
    ? 'http://13.201.235.2:5244'
    : null;

  return (
        <div className="relative" style={{ height: 'calc(100vh - 80px)' }}>
          {framework === "react" ? (
              <iframe
              ref={iframeRef}
              src={`${import.meta.env.VITE_DOCKER_PORT}${dPort}/?folder=/home/coder/project`}
              width="100%"
              height="100%"
              style={{ border: "none", display: "block" }}
              title="CodeSandbox IDE"
              />
          ) : framework === "vue" ? (
              <iframe
              ref={iframeRef}
              src='http://13.201.235.2:8151/?folder=/home/coder/project'
              width="100%"
              height="100%"
              style={{ border: "none", display: "block" }}
              title="CodeSandbox IDE"
              />
          ) : (
              <p style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
              🚫 Unauthorized access. You do not have permission to view this editor.
              </p>
          )}

          {outputSrc && (
            <div className="absolute bottom-6 right-6 z-50">
              <button
                onClick={() => setShowOutput(true)}
                className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow-lg
                            hover:bg-blue-700 hover:shadow-xl
                            transition duration-300 ease-in-out
                            focus:outline-none focus:ring-4 focus:ring-blue-300
                            ring-1 ring-blue-500/50 backdrop-blur-sm"
              >
                Output
              </button>
            </div>
          )}

          {/* Output overlay modal */}
          {showOutput && outputSrc && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
              <div className="relative w-[90vw] h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-3 bg-[#291571] text-white shrink-0">
                  <span className="font-semibold text-base tracking-wide">Output Preview</span>
                  <button
                    onClick={() => setShowOutput(false)}
                    className="text-white hover:text-red-300 text-2xl font-bold leading-none focus:outline-none"
                    aria-label="Close output"
                  >
                    &times;
                  </button>
                </div>
                {/* iframe fills remaining space */}
                <iframe
                  src={outputSrc}
                  width="100%"
                  className="flex-1"
                  style={{ border: "none", display: "block" }}
                  title="Output Preview"
                />
              </div>
            </div>
          )}
        </div>
      );
}
  
    return (
        <div className="overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        {
         renderContent()
        }
        </div>
    );
}
