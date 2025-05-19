import { PanelResizeHandle } from "react-resizable-panels";

import React from "react";

import { MdDragHandle } from "react-icons/md";

import '../styles/App.css';


export default function ResizeHandle({id}) {
  return (
    <PanelResizeHandle
      className='ResizeHandleOuter'
      id={id}>

      <div className='ResizeHandleInner'>
        <MdDragHandle size={18} style={{transform: 'rotate(90deg)', margin: '44vh -1px'}}/>
      </div>
    </PanelResizeHandle>
  );
}
