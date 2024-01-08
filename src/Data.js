import { db, sortMetrics } from '../config'
import { ref, child, get, onChildAdded, onValue, set } from 'firebase/database'
import { DataStructure } from './DataStructure';

const dataStructure = new DataStructure()
const db = dataStructure.getFirebase();