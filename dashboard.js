import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  updateDoc, 
  doc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { auth, db } from "./config.js";
const form = document.querySelector("#form");
const text = document.querySelector("#text");
const mind = document.querySelector("#mind");
const profileImg = document.querySelector("#profileImg");
const username = document.querySelector("#username");
const blogsContainer = document.querySelector("#blogsContainer");
const delBtn=document.querySelectorAll('.delBtn');
  const editBtn=document.querySelectorAll('.editBtn');
let currentUser = null;
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User logged in:", user.uid);
    try {
      const q = query(collection(db, "blogs"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      console.log("Query Snapshot Size:", querySnapshot.size);
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          console.log("User Data Found:", userData);
          currentUser = userData;
          username.innerHTML = userData.fullName || "Anonymous";
          profileImg.src =
            userData.image || "https://i.postimg.cc/nrn1rVW3/logo.jpg";
        });
      } else {
        console.log("No user profile found in blogs!");
        username.innerHTML = "Anonymous";
        profileImg.src = "https://i.postimg.cc/nrn1rVW3/logo.jpg";
      }

      displayUserBlogs(user.uid);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  } else {
    console.log("No user found");
    window.location = "login.html";
  }
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  // if (!currentUser) {
  //     console.log("No user data available!");
  //     return;
  // }
  try {
    const docRef = await addDoc(collection(db, "blogs"), {
      fullName: currentUser.fullName,
      email: currentUser.email,
      uid: auth.currentUser.uid,
      image: currentUser.image,
      text: text.value,
      mind: mind.value,
      type: "blog",
      createdAt: Timestamp.now()
    });
    console.log("Document written with ID: ", docRef.id);
    text.value = "";
    mind.value = "";
    displayUserBlogs(auth.currentUser.uid);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});
const displayUserBlogs = async (uid) => {
  blogsContainer.innerHTML = "";
  const blogIds = []; 

  const q = query(
    collection(db, "blogs"),
    where("uid", "==", uid),
    where("type", "==", "blog"),
    orderBy("createdAt", "desc")
  );

  try {
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => { 
      const blogData = docSnap.data();
      const blogElement = document.createElement("div");
      blogElement.classList.add("blog");

      let formattedDate = "N/A";
      if (blogData.createdAt && blogData.createdAt.seconds) {
        const date = blogData.createdAt.toDate();
        formattedDate = date.toLocaleString();
      }

      blogElement.innerHTML = `
        <div class="card">
          <div class="title">
            <img src="${blogData.image}" alt="" />
            <div class="about">
              <p>${blogData.text}</p>
              <span>By: ${blogData.fullName} , Date: ${formattedDate}</span>
            </div>
          </div>
          <div class="des">${blogData.mind}</div>

           <div class="stylebtn">
        <button class="delBtn">Delete</button>
          <button class="editBtn">Edit</button>
        </div>
        </div>
      `;
      
      blogsContainer.appendChild(blogElement);
      blogIds.push(docSnap.id); 

      
      const delBtn = blogElement.querySelector(".delBtn");
      delBtn.addEventListener("click", async () => {
        await deleteDoc(doc(db, "blogs", docSnap.id)); 
        console.log("Blog deleted");
        displayUserBlogs(uid);
      });

     
      const editBtn = blogElement.querySelector(".editBtn");
      editBtn.addEventListener("click", async () => {
        const updatedText = prompt("Enter new text:", blogData.text);
        const updatedMind = prompt("Enter new mind:", blogData.mind);

        if (updatedText && updatedMind) {
          const blogToUpdate = doc(db, "blogs", docSnap.id); 
          await updateDoc(blogToUpdate, {
            text: updatedText,
            mind: updatedMind,
          });
          console.log("Blog updated");
          displayUserBlogs(uid); 
        }
      });
    });
  } catch (error) {
    console.error("Error displaying blogs:", error);
  }
};

logoutbtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location = "login.html"
       
    }).catch((error) => {
        alert(error)
    });

})
