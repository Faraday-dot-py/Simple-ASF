import { getDatabase, ref, get} from "firebase/database";
import { initializeApp } from "firebase/app";
export class DataStructure {
    constructor() {
        this.dataValues = [0,0,"","",
            false,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,false,
            0,0,0,"","",""];
        this.dataLabels = ["Match", "Team", "Position", "Scout", 
            "Mobility", "Auto High Cube", "Auto Mid Cube", "Auto Low Cube", "Auto High Cone", "Auto Mid Cone", "Auto Low Cone", "Auto Fumbled", "Auto Climb", 
            "High Cube", "Mid Cube", "Low Cube", "High Cone", "Mid Cone", "Low Cone", "Fumbled", "Climb", "Park",
            "Defense Time", "Penalty Count", "Oof Time", "Climb QATA", "Intake QATA", "QATA"];
        this.dataTypes  = ["number", "number", "string", "string",
            "number", "number", "number", "number", "number", "number", "number", "number", "number",
            "number", "number", "number", "number", "number", "number", "number", "number", "number", 
            "number", "number", "number", "string", "string", "string"];            
        this.avgFilterLabels=[
            "Mobility",
            "Auto High Cube",
            "Auto Mid Cube",
            "Auto Low Cube",
            "Auto High Cone",
            "Auto Mid Cone",
            "Auto Low Cone",
            "Auto Fumbled",
            "Auto Climb", 
            "High Cube",
            "Mid Cube",
            "Low Cube",
            "High Cone",
            "Mid Cone",
            "Low Cone",
            "Fumbled",
            "Climb", 
            "Defense Time",
            "Penalty Count",
            "Oof Time"
        ];
        this.avgFilterLabelsAuto = [
            "Mobility",
            "Auto High Cube",
            "Auto Mid Cube",
            "Auto Low Cube",
            "Auto High Cone",
            "Auto Mid Cone",
            "Auto Low Cone",
            "Auto Fumbled",
            "Auto Climb"
        ];
        this.avgFilterLabelsTele = [
            "High Cube",
            "Mid Cube",
            "Low Cube",
            "High Cone",
            "Mid Cone",
            "Low Cone",
            "Fumbled",
            "Climb", 
            "Park"
        ];
        this.avgFilterLabelsDefPen = [
            "Defense Time",
            "Penalty Count",
            "Oof Time"
        ];
        this.spiderChartLabels = [
            "Auto Points", "Tele Cubes", "Tele Cones", "Tele Accuracy", "Endgame Points", "Defense Time"
        ];

        this.wghtValues = [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0];
        this.ptValues = [3, 6, 4, 3, 6, 4, 3, 0, 1, 5, 3, 2, 5, 3, 2, 0, 1, 0, 0, 0];
        this.autoPtValues = [3, 6, 4, 3, 6, 4, 3, 0, 1];
        this.telePtValues = [5, 3, 2, 5, 3, 2, 0, 1, 2];
        this.autoFilteredPtValues = [6, 4, 3];
        this.teleFilteredPtValues = [5, 3, 2];
        this.defPenPtValues = [1 / 6, 4, 0];
        this.storedRobotsTotalPtAvg = {}
        this.storedRobotsAvgPtVals = {}
        let obj = {};
        for (let i = 0; i < this.avgFilterLabels.length; i++) {
        obj[this.avgFilterLabels[i]] = this.ptValues[i];
        }
        this.ptValuesObject =  obj;

        this.pitscoutLabels = ['Timestamp','Team', 'Scouter', 'Scout Name', 'Drivetrain', 'Robot Weight', 'Number of Motors', 'Motor Type', 'Coding Language', 'Vision Capabilities', 'Vision', 'Auto', 'Auto Climb', 'Endgame Climb', 'Piece Type', 'Manipulator', 'Aluminum Assistance', 'Mech-Controls Issue?', 'Miscellaneous'];
        this.imageLabels = ['Timestamp', 'Team', 'Image of Robot'];

        this.firebasePath = "EVENT_PATH_HERE";
        this.firebaseConfig = {
            //insert your firebase API config here
        };
        this.app;
        this.database;

    }

    setFirebasePath(path) {
        console.log("Firebase path set to: " + path);
        this.firebasePath = path;
    }

    getDataValues() {
        return this.dataValues;
    }
    getDataValue(i) {
        return this.dataValues[i];
    }
    getDataLabels() {
        return this.dataLabels;
    }
    getDataLabel(i) {
        return this.dataLabels[i];
    }
    getDataTypes() {
        return this.dataTypes;
    }
    getDataType(i) {
        return this.dataTypes[i];
    }
    getPitscoutLabels() {
        return this.pitscoutLabels;
    }
    getPitscoutLabel(i) {
        return this.pitscoutLabels[i];
    }
    getPath(type) {
        return this.firebasePath + type + "/";
    }
    searchPointValue(label) {
        return this.ptValuesObject[label];
    }
    setDataValues(arr) {
        this.dataValues = arr;
    }
    setDataValues(i, val) {
        this.dataValues[i] = val;
    }
    getFilterLabels() {
        return this.avgFilterLabels;
    }
    getFilterLabelsAuto() {
        return this.avgFilterLabelsAuto;
    }
    getFilterLabelsTele() {
        return this.avgFilterLabelsTele;
    }
    getFilterLabelsDefPen() {
        return this.avgFilterLabelsDefPen;
    }
    getWghtValues() {
        return this.wghtValues;
    }
    getPtValues() {
        return this.ptValues;
    }
    getAutoPtValues() {
        return this.autoPtValues;
    }
    getTelePtValues() {
        return this.telePtValues;
    }
    getDefPenPtValues() {
        return this.defPenPtValues;
    }
    getStoredRobotsTotalPtAvg(){
        return this.storedRobotsTotalPtAvg;
    }
    getStoredRobotsAvgPtVals(){
        return this.storedRobotsAvgPtVals;
    }
    getSpiderChartLabels() {
        return this.spiderChartLabels;
    }

    getFireBase(){
        this.app = initializeApp(this.firebaseConfig);
        this.database = getDatabase(this.app);
        return this.database;
    }

    createDataLabels(...givenLabels){
        this.lableArray = [];
        for(var i =0; i<givenLabels.length;i++){
            this.lableArray.push(givenLabels[i])
        }
        return this.lableArray;
    }

    calcRobotPtAvgs(dataLabelsToCalc, robot){
        this.matches = Object.keys(robot)
        this.totalPtAvg = 0;
        this.robotAvgPtVals={}
        //for loop over all data points wanted to be avg 
        for(var i=0; i<dataLabelsToCalc.length;i++){
        this.singlePtAvg = 0
        //adds up all match data for that data point wanted to be avged
        for(var j=0; j<this.matches.length; j++){
                    //adds value to temp val, which is the value that will later be avged
            this.singlePtAvg += parseInt(robot[this.matches[j]][dataLabelsToCalc[i]])
        }
        //takes the the avg and rounds it to the tenth, then multiply by weight then equalizer, later want to make weight easily changeable
        //stores this avg int avg_tracker in table_cache
        this.singlePtAvg/= this.matches.length
        this.singlePtAvg = this.singlePtAvg.toFixed(1)
        this.robotAvgPtVals[dataLabelsToCalc[i]] = this.singlePtAvg
        this.singlePtAvg*= this.wghtValues[i] * this.ptValues[i];
        this.singlePtAvg = this.singlePtAvg.toFixed(1)
        this.totalPtAvg+=parseFloat(this.singlePtAvg)
        }
        //puts the total avg to the robot, and vice versa
        this.totalPtAvg = this.totalPtAvg.toFixed(1)
        this.storedRobotsAvgPtVals[robot[this.matches[0]]["Team"]] = this.robotAvgPtVals

        this.storedRobotsTotalPtAvg[robot[this.matches[0]]["Team"]] = this.totalPtAvg
    }

    calcRobotRanking(){
        this.robotRankByPt = [];
        this.allRobotPts = Object.keys(this.storedRobotsTotalPtAvg)
        for(var i=0;i<this.allRobotPts.length;i++){
          if(this.robotRankByPt.indexOf(this.storedRobotsTotalPtAvg[this.allRobotPts[i]]) == -1){
            this.robotRankByPt.push(this.storedRobotsTotalPtAvg[this.allRobotPts[i]])
          }
        }
        this.robotRankByPt.sort(function(a,b){return a-b})
        return this.robotRankByPt;
    }
    
    reset() {
        this.storedRobotsTotalPtAvg = {}
        this.storedRobotsAvgPtVals = {}
    }
    searchAndShowRobotData(path, team, db, func) {
        this.setPath = this.getPath(path + "/" + team);
        get(ref(db, this.setPath)).then((snapshot) => {
            this.data = snapshot.val()
            func(this.data)
        })
    }

    changeWghtValues(newWeights){
        for(var i=0;i<this.wghtValues.length;i++){
            this.wghtValues[i] = parseInt(newWeights[i])
          }
    }

    calcAvgAutoPts(currentRobotData){
        let autoScore = 0.0
        for (let j = 0; j < this.avgFilterLabelsAuto.length; j++) {
            let avgVal = 0.0;
            for (let k = 0; k < currentRobotData.length; k++) {
              avgVal += currentRobotData[k][this.avgFilterLabelsAuto[j]] / currentRobotData.length;
            }
            autoScore += avgVal * this.autoPtValues[j];
          }
        return autoScore
    }

    calcAvgTelePts(currentRobotData){
        let teleScore = 0.0
        for (let j = 0; j < this.avgFilterLabelsTele.length; j++) {
            let avgVal = 0.0;
            for (let k = 0; k < currentRobotData.length; k++) {
              avgVal += currentRobotData[k][this.avgFilterLabelsTele[j]] / currentRobotData.length;
            }
            teleScore += avgVal * this.telePtValues[j];
          }
        return teleScore
    }
    
}