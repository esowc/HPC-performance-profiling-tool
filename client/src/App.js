import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap } from 'react-flow-renderer';
import { useDispatch } from 'react-redux'
// import axios from 'axios';
import {
  // SidebarMenu,
  CustomComponent,
  CustomEdge,
  // Filter,
  Selector,
  DataSource,
  OutputNode,
  // DataDisplay
} from './components/';
import { getFlows } from './utils';
import { updateAction, addElementsAction } from './store';

const nodeTypes = {
  customNode: CustomComponent,
  agregatorNode: CustomComponent
};

const edgeTypes = {
  custom: CustomEdge,
};

const graphStyles = {
  width: '100vw',
  height: '100vh',
  maringLeft: '200px'
};

const BasicGraph = ({ elements, setElements }) => {
  const [selected, setSelected] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const removeEls = (myArray, toRemove) => {
      for (let i = myArray.length - 1; i >= 0; i--) {
        for (let j = 0; j < toRemove.length; j++) {
          if (('' + myArray[i]?.source).startsWith('' + toRemove[j].id) || (myArray[i]?.target + '').startsWith('' + toRemove[j].id)) {
            myArray.splice(i, 1);
          }
        }
      }

      for (let i = myArray.length - 1; i >= 0; i--) {
        for (let j = 0; j < toRemove.length; j++) {
          if (myArray[i] && (myArray[i].id === toRemove[j].id)) {
            myArray.splice(i, 1);
          }
        }
      }
      return myArray;
    }
    document.onkeypress = function (evt) {
      evt = evt || window.event;
      var charCode = evt.keyCode || evt.which;
      if (charCode === 127) {
        let elsCopy = [...elements];
        setElements((removeEls(elsCopy, selected)));
        dispatch(addElementsAction(removeEls(elsCopy, selected)));
      }
    };
  }, [selected, setElements, elements, dispatch])

  const onConnect = (params) => {
    setElements((els) => {
      const edge = {
        ...params,
        id: 'HPC_LINK_' + params.source + params.target + '_' + (Math.random() * 100),
        type: 'custom',
        className: 'HPC_LINK'
      };
      dispatch(addElementsAction([...els, edge]));

      return [...els, edge];
    });
  }

  return (
    <ReactFlow
      onConnect={onConnect}
      nodesConnectable={true}
      elements={elements}
      style={graphStyles}
      onSelectionChange={e => {
        if (e?.length > 0)
          setSelected(e);
      }}
      zoomOnScroll={true}
      elementsSelectable={true}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionLineStyle={{ strokeWidth: '5px', stroke: '#3289a8' }}
    >
      <MiniMap
        nodeColor={(node) => {
          switch (node.type) {
            case 'input': return 'red';
            case 'default': return '#00ff00';
            case 'output': return 'rgb(0,0,255)';
            default: return '#eee';
          }
        }}
      />
    </ReactFlow>
  );

}

const getLinks = (elements) => {
  return elements?.filter(e => e.target);
}

const getNodes = (elements) => {
  return elements?.filter(e => e.data);
}


// the type is used so that we can see which one is the data source
/**
 * Also the output node has a type for :: plotly picture sau text output
 * TODO create factory for the nodes; 
 * Add every node in there
 */
const initialElements = [
  {
    id: '1',
    type: 'customNode',
    data: { children: (props) => <DataSource {...props} />, type: 'Dsource' },
    style: { border: '1px solid #777' },
    position: { x: 250, y: 50 },
  },
  {
    id: '2',
    type: 'customNode',
    data: { children: (props) => <Selector {...props} endpoint='columns' />, type: 'DSelector' },
    style: { border: '1px solid #777' },
    position: { x: 280, y: 300 },
  },
  // {
  //   id: '3',
  //   type: 'customNode',
  //   data: {
  //     children: (props) => <OutputNode props={props} type='text' url={{
  //       "data": {
  //         "x": "1",
  //         "y": "1",
  //         "url": "http://url.com"
  //       },
  //       "event": "start",
  //       "show": 1,
  //     }} />
  //     , type: 'Onode'
  //   },
  //   style: { border: '1px solid #777' },
  //   position: { x: 280, y: 400 },
  // },
  {
    id: '4',
    type: 'customNode',
    data: { children: (props) => <Selector {...props} endpoint='rows' />, type: 'DSelector' },
    style: { border: '1px solid #777' },
    position: { x: 300, y: 500 },
  },
  {
    id: '5',
    type: 'customNode',
    data: { children: (props) => <OutputNode props={props} type='display'/>, type: 'Onode' },
    style: { border: '1px solid #777' },
    position: { x: 300, y: 800 },
  },

];

export default function App() {
  // const [initialID, setInitialID] = useState(1);
  // const [dragableObjects, setDragableObjects] = useState([]);
  const [dragableObjects, ] = useState([]);
  const [elements, setElements] = useState(initialElements);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!dragableObjects.length)
      return
    let newElem = {
      // TODO do not calculate id like this
      id: '' + ((Math.random() * 1000) % 1000),
      data: { label: dragableObjects },
      position: { x: ((Math.random() * 500) % 500), y: ((Math.random() * 500) % 500) }
    };
    setElements(els => [...els, newElem]);
    dispatch(addElementsAction([...elements, newElem]));
  }, [dragableObjects, dispatch, elements]);

  useEffect(() => {
    dispatch(updateAction(getFlows(getLinks(elements), getNodes(elements))));
  }, [elements, dispatch]);

  return (
    <div>
      <div style={{ display: "flex" }}>
        {/* <div style={{
          width: "300px",
          height: "100vh",
          boxShadow: "0 20px 20px rgba(0,0,0,0.30)"
        }}>
          <div style={{ boxShadow: "0 2px 0px rgba(0,0,0,0.20)", paddingBottom: '0.5px' }}>
            <p className="mdc-typography--headline1"
              style={{
                textAlign: "center",
                fontSize: "30px"
              }}>
              Dashboard Menu
          </p>
          </div>
          {
            jsonExample.array.map((e, idx) => <SidebarMenu
              key={idx}
              componentName={e.componentName}
              componentLocation={e.componentLocation}
              componentCallback={(name) => setDragableObjects(name)}
              componentImage={e.componentImage}
            />
            )
          }
        </div> */}
        <BasicGraph elements={elements} setElements={setElements} />
      </div>
    </div>
  );
}
