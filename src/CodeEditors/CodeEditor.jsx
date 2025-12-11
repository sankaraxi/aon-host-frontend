import { useEffect, useState,useRef  } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function CodeEditor() {
    const [isAuthorized, setIsAuthorized] = useState(false);
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

    console.log("User role:", userRole);

    if (["4", "3", "5"].includes(userRole)) {
      setIsAuthorized(true); // Let them through
    } else {
      navigate("/"); // Kick 'em out
    }
  }, [navigate]);

function renderContent() {
  return (
        <div className="relative h-[650px]">
          {framework === "react" ? (
              <iframe
              src={`http://localhost:${dPort}/?folder=/home/coder/project`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="CodeSandbox IDE"
              />
          ) : framework === "vue" ? (
              <iframe
              src='http://localhost:8151/?folder=/home/coder/project'
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="CodeSandbox IDE"
              />
          ) : (
              <p style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
              🚫 Unauthorized access. You do not have permission to view this editor.
              </p>
          )}

{
            framework === "react" ? (
              <div className="absolute bottom-6 right-6 z-50">
                <Link to={`http://localhost:${oPort}`} target="_blank" rel="noopener noreferrer">
                    <button className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow-lg
                                    hover:bg-blue-700 hover:shadow-xl
                                    transition duration-300 ease-in-out
                                    focus:outline-none focus:ring-4 focus:ring-blue-300
                                    ring-1 ring-blue-500/50 backdrop-blur-sm">
                            Output
                    </button>
                </Link>
              </div>
            ) : framework === "vue" ? (
              <div className="absolute bottom-6 right-6 z-50">
                <Link to='http://localhost:5244' target="_blank" rel="noopener noreferrer">
                    <button className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow-lg
                                    hover:bg-blue-700 hover:shadow-xl
                                    transition duration-300 ease-in-out
                                    focus:outline-none focus:ring-4 focus:ring-blue-300
                                    ring-1 ring-blue-500/50 backdrop-blur-sm">
                            Output
                    </button>
                </Link>
              </div>
            ) : (
              <p style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
              🚫 Unauthorized access. You do not have permission to view this output.
              </p>
            )
          }
        </div>
      )
}
  
    return (
        <div className=""> {/* 👈 height added */}



        {
         renderContent()
        }
        
        </div>

    );
}
