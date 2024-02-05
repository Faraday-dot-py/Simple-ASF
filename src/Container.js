
/**
 *  --- TODO ---
 * Create optional "useMetadata" prop for Config.js -- COMPLETE
 * Rework firebase to use the new data format -- COMPLETE (By default)
 * Edit documentation 
 * Config to allow switching between CSV and JSON -- COMPLETE
*/

import './App.css';

import CheckBox from './widgets/CheckBox';
import TextBox from './widgets/TextBox'
import TextBoxLong from './widgets/TextBoxLong'
import Counter from './widgets/Counter'
import Dropdown from './widgets/Dropdown';

import layout from './layout.json'
import config from './Config.js'

import logo from './images/patribotsLogo.png';

import {v4 as uuidv4} from "uuid"
import React from 'react';

import { getDatabase, ref, update } from "firebase/database";
import { initializeApp } from "firebase/app";


const app = initializeApp(config.firebaseConfig);

const isInteractable = (type) => {
  switch (type) {
    case "header":
      return false;
    case "label":
      return false;
    case "submit":
      return false;
    case "export":
      return false;
    default:
      return true;
  }
}

// Just a lil QOL function to add ids to the layout
// The last version had you do this manually (ugh)
Object.keys(layout).forEach((item) => {
  layout[item].id = uuidv4()
})

class Container extends React.Component{
  /**
   * HOW THE STATE WORKS:
   * interactables holds all of the components that could have data entered into them
   * interactables is an array of objects, each object has the following properties:
   * - item: the actual component
   * - id: the id of the component
   * - value: the value of the component
   * 
   * When the user enters data into a component, the component calls a function 
   * that updates the state
   * This function takes the id of the component and the value of the component 
   * and updates the corresponding value in state with that new value
   * 
   * When the user submits the form, the function gatherData is called
   * which just passes the interactables list into the function [writeMatchDataToDB]
   * - I'm going to remove the gatherData function, bc it's not really necessary
   *   when the data is already stored in interactables
   */
  state = {
    interactables: layout.filter((item) => (isInteractable(item.type)))
  }

  wipeForm = () => {
    // Update the state to reflect the fact that all of the interactables are now empty
    this.setState({
      interactables: this.state.interactables.map((item) => {
        item.value = item.resetToValue
        return item
      })
    })
    // Update what's actually rendered on the page to reflect the state
    this.state.interactables.forEach((item) => {
      switch (item.type) {
        case "checkbox":
          document.getElementById(item.id).checked = false
          break;
        case "textbox":
          document.getElementById(item.id).value = (item.resetToValue === undefined) ? ""  : item.resetToValue
          break;
        case "textboxlong":
          document.getElementById(item.id).value = (item.resetToValue === undefined) ? ""  : item.resetToValue
          break;
        case "counter":
          document.getElementById(item.id).value = (item.resetToValue === undefined) ? 0  : item.resetToValue
          break;
        case "dropdown":
          document.getElementById(item.id).value = (item.resetToValue === undefined) ? 0  : item.resetToValue
          break;
      }
    })
    
  }

  handleTextBoxChange = (id, value) => {
    this.setState({
      interactables: this.state.interactables.map((item) => {
          if (item.id === id) {
            item.value = value
          }
          return item
        })
    })
  }

  handleCheckBoxChange = (id, value) => {
    this.setState({
      interactables: this.state.interactables.map((item) => {
          if (item.id === id) {
            item.value = !item.value
          }
          return item
        })
    })
  }

  handleCounterChange = (id, value, limiter) => {
    this.setState({
      interactables: this.state.interactables.map((item) => {
          if (item.id === id) {
            if (limiter === undefined) {
              item.value = item.resetToValue
              return item
            }
            item.value += value
            if (value > 0 && item.value > limiter) {
              item.value -= value
            }
            else if (value < 0 && item.value < limiter) {
              item.value -= value
            }
          }
          return item
        })
    })
  }

  handleDropdownChange = (id, value) => {
    this.setState({
      interactables: this.state.interactables.map((item) => {
          if (item.id === id) {
            item.value = value
          }
          return item
        })
    })
  }
  
  writeMatchDataToDB = (data) => {
    const db = getDatabase();
    
    let json = {};
    console.log("data: ", data)
    
    if (config.useTPS === false) {
      data.forEach((item) => {
        json[item[0]] = ((item[1] === undefined) ? "" : item[1])
      })

      let path = ""
      config.sortMetrics.forEach((item) => {
        if (json[item] === undefined) {throw "Sort metric [" + item + "] not found in data"}
        path += json[item] + "/"
        delete json[item]
      })
      path = path.slice(0, -1)

      update(ref(db, path), json)

      return true
    }
    else {
      let path = "entries/" + Date.now() + "/"
      
      console.log(">>", data)
      update(ref(db, path), data)
      
      return true

    }
    
  };

  handleFormSubmit = (e) =>{
    console.log("submitting form")
    e.preventDefault()
    // 0 is the data's title, 1 is the data's value, 2 is the data's category (which may or may not exist)
    let missingRequiredFields = []
    let data = this.state.interactables.map((item) => {
      // If the item is required and is empty, or if the item is metadata and useTPS is true and the item is empty, add it to the list of missing required fields
      if ((item.required || (config.useTPS && item.category === "metadata"))  && (item.value === "" || item.value === 0 || item.value === undefined)) {
        missingRequiredFields.push(item.title)
      }
      
      // Return the item's title, value, and it's category if useTPS is true. If a category is not specified, default to "data"
      return [item.title, item.value, (config.useTPS ? (item.category !== undefined ? item.category : "data") : undefined)]
    })

    // Make sure that you don't have any missing required fields
    if (missingRequiredFields.length > 0) {
      alert("You are missing the following " + missingRequiredFields.length + " required fields: " + missingRequiredFields.join(", ")); 
      console.log("not submitted, missing required field(s) [" + missingRequiredFields.join(",") + "]")
      return
    }

    // Reformat data for TPS
    if (config.useTPS) {
      var formattedData = {}
      data.forEach((item) => {
        if (item[2] === undefined) {
          item[2] = "data"
          console.warn("No category specified for item [" + item[0] + "], defaulting to 'data'")
        }
        
        if (formattedData[[item[2]]] === undefined) {
          formattedData[[item[2]]] = {}
        }
        formattedData[[item[2]]][item[0]] = item[1]
      }
      )
      data = formattedData
    } else {
      data = data.map((item) => {return [item[0], item[1]]})
    }
    

    let oldLocalStorage = localStorage.getItem("matchData")
    oldLocalStorage = JSON.parse(oldLocalStorage === "" ? "[]" : oldLocalStorage)
    localStorage.setItem("matchData", JSON.stringify([...((oldLocalStorage === null) ? [] : oldLocalStorage), data]))

    try {
      let successfullySubmitted = this.writeMatchDataToDB(data)
      if (!successfullySubmitted) {
        throw "Database error: The database refused to accept the data (idk)."
      }
      else {
        alert("Successfully submitted data to database."); 
        this.wipeForm()

      } 
    }
    catch (e) {
      console.log(e)
      alert("Something went wrong. Please try again.")
      return
    }
    
  }


  /**
   * @deprecated This method is deprecated. Use exportDataAsJSON instead.
   */
  exportDataAsCSV =() => {
    let cachedDataJSON = (JSON.parse(localStorage.getItem("matchData")))
    let cachedDataCSV = ""
    for (let element in this.state.interactables) {
      cachedDataCSV += this.state.interactables[element].title + ","
    }

    if (cachedDataJSON != null){
      for (let i = 0; i < cachedDataJSON.length; i++){
        for (let e = 0; e < cachedDataJSON[i].length; e++){
          cachedDataCSV += cachedDataJSON[i][e][1] + ","
        }
        cachedDataCSV += "\n"
      }
    }


    let file = new Blob([cachedDataCSV], {type: "text/csv"})
    let blobURL = window.URL.createObjectURL(file)

    const anchor = document.createElement('a');
    anchor.href = blobURL
    anchor.target = "_blank"
    anchor.download = "matchData.csv"

    anchor.click()

    URL.revokeObjectURL(blobURL);
  }

  exportDataAsJSON =() => {
    let cachedDataJSON = (JSON.parse(localStorage.getItem("matchData")))
    
    let file = new Blob([JSON.stringify(cachedDataJSON)], {type: "text/json"})
    let blobURL = window.URL.createObjectURL(file)

    const anchor = document.createElement('a');
    anchor.href = blobURL
    anchor.target = "_blank"
    anchor.download = "matchData.json"

    anchor.click()

    URL.revokeObjectURL(blobURL);
  }

  getInteractable = (id) => {
    return this.state.interactables.filter((item) => (item.id === id))[0]
  }

  c = () => {
    this.setState({
      d: (this.state.d === undefined ? 1 : this.state.d) + 1
    })
    if (this.state.d > 1) {
      alert("You have clicked the logo " + this.state.d + " times. You have no life.")
      console.log(atob("JWNUaGlzIHNjb3V0aW5nIGFwcGxpY2F0aW9uIHdhcyBtYWRlIGJ5IEFkYW0gV2ViYiwgYW4gYWx1bW5pIG9mIEZSQyBUZWFtIDQ3MzgsIHRoZSBQYXRyaWJvdHMuIApUaGlzIGFwcGxpY2F0aW9uIGlzIG9wZW4gc291cmNlIGFuZCBjYW4gYmUgZm91bmQgYXQgaHR0cHM6Ly9naXRodWIuY29tL0ZhcmFkYXktZG90LXB5L1NpbXBsZS1BU0YKSSBob3BlIHlvdSBlbmpveSB1c2luZyB0aGlzIGFwcGxpY2F0aW9uIGFzIG11Y2ggYXMgSSBlbmpveWVkIG1ha2luZyBpdCwgYW5kIGdvb2QgbHVjayB0byB5b3UgaW4geW91ciBjb21wZXRpdGlvbiEKClBTLiBJZiB5b3UncmUgcmVhZGluZyB0aGlzLCB5b3UgZWl0aGVyIHJlYWxseSBoYXZlIG5vIGxpZmUgb3IgeW91IGFyZSBhIGRldmVsb3BlciAoc2FtZSB0aGluZyBlaXRoZXIgd2F5KS4gCklmIHlvdSBhcmUgYSBkZXZlbG9wZXIsIHBsZWFzZSBjb25zaWRlciBjb250cmlidXRpbmcgdG8gdGhpcyBwcm9qZWN0LiBJIHdvdWxkIGxvdmUgdG8gc2VlIHRoaXMgcHJvamVjdCBncm93IGFuZCBiZWNvbWUgYSB1c2VmdWwgdG9vbCBmb3Igc2NvdXRpbmcgdGVhbXMgYXJvdW5kIHRoZSB3b3JsZC4gCklmIHlvdSBhcmUgYSB1c2VyLCBwbGVhc2UgY29uc2lkZXIgc2hhcmluZyB0aGlzIGFwcGxpY2F0aW9uIHdpdGggb3RoZXIgdGVhbXMuIApBbHNvLCBmZWVsIGZyZWUgdG8gbWFrZSBhIHB1bGwgcmVxdWVzdCBpZiB5b3UgaGF2ZSBhbnkgaWRlYXMgZm9yIGltcHJvdmVtZW50cyBvciBuZXcgZmVhdHVyZXMuIFRoYW5rcyE="), "font-weight: bold")
    }
  }

  render () {
    return (
      <div className="app">
        <image src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR71FESRUZEUb2_52JI8EZhNkaQ3fn0p1vFU8UANUePHUI2qQbzsFqS12lnWCv1Fj6S87k&usqp=CAU"}/>
        <ul className="outer-container">
          {Object.keys(layout).map((item) => {
            if (isInteractable(layout[item].type)) {
            }
            switch (layout[item].type) {
              case "header":
                return <h1          id={layout[item].id} className={"widget header " + layout[item].decorator}>{layout[item].value}</h1>
              case "label":
                return <h3          id={layout[item].id} className={"widget label " + layout[item].decorator}>{layout[item].value}</h3>
              case "checkbox":
                return <CheckBox    id={layout[item].id} title={layout[item].title + (config.renderRequiredStars ? (layout[item].required ? " *" : "") : "")} decorator={layout[item].decorator} value={layout[item].value} resetToValue={layout[item].resetToValue} changeHandler={this.handleCheckBoxChange}/>
              case "textbox":
                return <TextBox     id={layout[item].id} title={layout[item].title + (config.renderRequiredStars ? (layout[item].required ? " *" : "") : "")} decorator={layout[item].decorator} value={this.getInteractable(layout[item].id).value} resetToValue={layout[item].resetToValue} changeHandler={this.handleTextBoxChange}/>
              case "textboxlong":
                return <TextBoxLong id={layout[item].id} title={layout[item].title + (config.renderRequiredStars ? (layout[item].required ? " *" : "") : "")} decorator={layout[item].decorator} value={layout[item].value} resetToValue={layout[item].resetToValue} changeHandler={this.handleTextBoxChange}/>
              case "counter":
                return <Counter     id={layout[item].id} title={layout[item].title + (config.renderRequiredStars ? (layout[item].required ? " *" : "") : "")} decorator={layout[item].decorator} value={layout[item].value} resetToValue={layout[item].resetToValue} changeHandler={this.handleCounterChange} increment={layout[item].increment} maxValue={layout[item].maxValue} minValue={layout[item].minValue}/>
              case "dropdown":
                return <Dropdown    id={layout[item].id} title={layout[item].title + (config.renderRequiredStars ? (layout[item].required ? " *" : "") : "")} decorator={layout[item].decorator} value={layout[item].value} resetToValue={layout[item].resetToValue} changeHandler={this.handleDropdownChange} options={layout[item].options}/>
              case "submit":
                return <span className='widget submit-container'><button      id={layout[item.id]} className={"submit " + (this.decorator ? this.decorator : "")} onClick={this.handleFormSubmit}>{layout[item].title}</button></span>
              case "export":
                return <button onClick={this.exportDataAsJSON}>{layout[item].title}</button>
              default:
                return <div>error: undefined widget type [{layout[item.type]}]</div>
            }
          })}
          
          <img src={logo} alt="" id="image" style={{height:0,width:0}} onClick={this.c}/>
        </ul>
      </div>
    );
  }
}

export default Container;
