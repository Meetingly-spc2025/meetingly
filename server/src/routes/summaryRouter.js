const express = require("express");
const router = express.Router();
const db = require("../models/db_users");
const { v4: uuidv4 } = require("uuid");

router.post('/', async (req, res) => {
    const { transcript, summary, tasks, meeting_id } = req.body; 
  
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' '); 
  
    const generateUUID = () => {
        return uuidv4(); 
      };
  
    const data = [
      { summary_id: generateUUID(), status: 'fulltext', content: transcript, created_at: currentTimestamp, meeting_id },
      { summary_id: generateUUID(), status: 'keypoint', content: summary, created_at: currentTimestamp, meeting_id },
      { summary_id: generateUUID(), status: 'action', content: tasks, created_at: currentTimestamp, meeting_id }
    ];
  
    try {
      const query = `
        INSERT INTO summarys (summary_id, status, content, created_at, meeting_id)
        VALUES (?, ?, ?, ?, ?)
      `;
  
      for (let item of data) {
        const values = [item.summary_id, item.status, item.content, item.created_at, item.meeting_id];
        await db.execute(query, values); 
      }
  
      res.status(200).send('데이터 저장 완료');
    } catch (error) {
      console.error('DB 저장 오류:', error);
      res.status(500).send('서버 오류');
    }
  });
  

module.exports = router;