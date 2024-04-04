import { useState, useContext, useEffect, useRef} from "react";
import {userContext} from '../../context/userContext'
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import useAnnouncementForm from '../components/AnnouncementForm'

// Home page should be for announcements/updates

function Home() {
  const {user} = useContext(userContext)

  //these announcements are hard coded, the real announcements will need to be retrieved from database 
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const showData = async () => {
      const {data} = await axios.get('/announcementget')
      setAnnouncements(prevAnnouncements => [
        ...prevAnnouncements,
        ...data.reverse().map(item => ({ title: item.title, body: item.text })), 
      ]);
    }
    showData()
  }, [])


  function createAnnouncementDraft() {
    setShowForm(true);
  }

  function cancelAnnouncement() {
    setShowForm(false);
  }

  const updateAnnouncements = async (e) => {
    e.preventDefault();
    const title = e.target[0].value;
    const text = e.target[1].value;
    if(showForm) {
      try {
        const dbAnnouncementUpdate = await axios.post('/announcement', { title, text})
        if (dbAnnouncementUpdate.error) {
          toast.error(dbAnnouncementUpdate.error)
        } else {
          setShowForm(false)
          setAnnouncements([{title: title, body: text}, ...announcements]);
          toast.success('New Announcement Added!')
        }
      } catch (error) {
        console.log(error)
      }
    }
  }



  return (

    <div>
      {user ? (<div className="announcements-page">
        <div className="announcements-title">
          <p className="pages-title">Announcements</p>
          {user.role === 'Admin' && (<p className='add-announcement' onClick={() => createAnnouncementDraft()}>+</p>)}
        </div>
        {showForm && (
          <form onSubmit={updateAnnouncements} key={uuidv4()} className="announcement-container">
            <input type="text" placeholder="Title Text..."/>
            <textarea 
              key="text"
              placeholder="text goes here..." 
              className="new-announcement-textarea" 
            />
            <div className="announcement-options">
              <button className="announcement-option cancel" onClick={cancelAnnouncement}>Cancel</button>
              <button type="submit" className="announcement-option submit">Submit</button>
            </div>
          </form>
        )}
        {announcements.map(announcement => (
          <div key={uuidv4()} className="announcement-container">
            <p>{announcement.title}</p>
            <textarea className="announcement-container-textarea" value={announcement.body} readOnly />
          </div>
        ))}
      </div>) : (
        <div className="unauthorized-container">
          <div className="unauthorized-message"> Unauthorized!</div>
          <div className="message">You are not authorized to see this page. Please <Link to={'/Login'}>Login</Link> First</div>
        </div>
      )}
    </div>
  );
}
  
export default Home;