import { JSXElementConstructor, Key, ReactElement, ReactNode, useEffect, useState } from "react";



const ContextMenu = () => {

  const [position, setPosition] = useState({top: null, left: null});

  useEffect(() => {
    const registerRightClick = (e: { preventDefault: () => void; clientY: any; clientX: any; }) => {
      e.preventDefault();
      setPosition({ top: e.clientY, left: e.clientX });
    };
    const clickAnywhere = () => {
      setPosition(undefined);
    };
    
    document.addEventListener("contextmenu", registerRightClick);
    document.addEventListener("click", clickAnywhere);

    return () => {
      document.removeEventListener("contextmenu", registerRightClick);
      document.removeEventListener("click", clickAnywhere);
    };


  }, []);

  return (
    <>
      {position && (


          <div className="bg-grayNew-600 rounded-md w-32 h-24">

            
          </div>


      )}
    </>
  );
};

export default ContextMenu;
