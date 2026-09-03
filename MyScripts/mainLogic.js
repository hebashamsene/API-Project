const baseUrl="https://tarmeezacademy.com/api/v1";

function toggleLoader(show=true){
  if(show){
    document.getElementById("loader").style.visibility='visible'
  }else{
    document.getElementById("loader").style.visibility='hidden'
  }
}

function getCurrentUser(){
    let user=null;
    const storageUser=localStorage.getItem("user");
    if(storageUser!=null){
    user=JSON.parse(storageUser);
    }
    return user;
}

//   for hidden the login and register buttons after login
function setupUI(){
    // for get the token from local storage for sure that user is register
    const token=localStorage.getItem("token");
    // fetch the divs that content buttons by id
    const loginDiv=document.getElementById("logged-in-div");
    const logoutDiv=document.getElementById("logout-div");
    // fetch the add button
    const addBtn=document.getElementById("add-btn");
    
    if(token==null){
        // user is not logged in(is guest)
        if(addBtn!=null){
            addBtn.style.setProperty("display","none","important");
        }
        loginDiv.style.setProperty("display","flex","important");
        logoutDiv.style.setProperty("display","none","important");
    }else{
        // user is logged in
        if(addBtn!=null){
            addBtn.style.setProperty("display","block","important");
        }
        loginDiv.style.setProperty("display","none","important");
        logoutDiv.style.setProperty("display","flex","important");
        // for show the username 
        const user=getCurrentUser()
        document.getElementById("nav-username").innerHTML=user.username;
        // for show the image of username
        document.getElementById("nav-user-image").src=user.profile_image;
    }
}


function loginBtnClicked(){
        const password= document.getElementById("password-input").value;
        const username= document.getElementById("username-input").value;

        const params={
        "username":username,
        "password":password
        }
        const url=`${baseUrl}/login`;
        toggleLoader(true);
        axios.post(url,params)
        .then((response)=>{
            toggleLoader(false);
            // console.log(response.data.token)
            localStorage.setItem("token",response.data.token);
            localStorage.setItem("user",JSON.stringify(response.data.user));
            //  for close modal*
            // fetch modal element by id
            const modal=document.getElementById("login-modal");
            // convert the element for instance
            const modalInstance= bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            console.log(password,username);
            showAlert("Logged in successfully","success");
            setupUI();
        }).catch((error)=>{
            const errorMessage=error.response.data.message;
            showAlert(errorMessage,"danger");
            console.log(error);

        }).finally(()=>{
            toggleLoader(false);
        })
    }

    function registerBtnClicked(){
    const password= document.getElementById("register-password-input").value;
    const username= document.getElementById("register-username-input").value;
    const name= document.getElementById("register-name-input").value;
    const image= document.getElementById("register-image-input").files[0];

    let formData=new FormData();
    formData.append("name",name);
    formData.append("username",username);
    formData.append("password",password);
    formData.append("image",image);

    const headers={
    "Content-Type":"multipart/form-data"
    }

    const url=`${baseUrl}/register`;
    toggleLoader(true);
    axios.post(url,formData,{
    headers:headers
    })
    .then((response)=>{
        console.log(response.data)
        localStorage.setItem("token",response.data.token);
        localStorage.setItem("user",JSON.stringify(response.data.user));
        //  for close modal*
        // fetch modal element by id
        const modal=document.getElementById("register-modal");
        // convert the element for instance
        const modalInstance= bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        
        showAlert("New User Registered successfully","success");
        setupUI();
    }).catch((error)=>{
        const errorMessage=error.response.data.message;
        showAlert(errorMessage,"danger");
        console.log(error)
    }).finally(()=>{
        toggleLoader(false);
    })
}

 function logout(){
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        showAlert("Logged out successfully","success");
        setupUI();
     }

function showAlert(customMessage,type="success"){
    const alertPlaceholder = document.getElementById('success-alert')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')

        alertPlaceholder.append(wrapper)
        }
            appendAlert(customMessage, type);
        //  to hidden alert
        setTimeout(()=>{
            const alert = bootstrap.Alert.getOrCreateInstance('#success-alert');
        //    alert.close();
        // todo:
        },2000);
}

// post request
function confirmPostDelete(){
    const postId=document.getElementById("delete-post-id-input").value;
    const url=`${baseUrl}/posts/${postId}`;
    const token=localStorage.getItem("token");
    const headers={
        "Authorization":`Bearer ${token}`
    };

    axios.delete(url, { headers: headers })
    .then((response)=>{
        const modal=document.getElementById("delete-post-modal");
        const modalInstance= bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        showAlert("The Post Has Been Deleted successfully","success");
        
        // تعديل مهم: إعادة جلب المنشورات المتبقية لتحديث الواجهة فوراً
        getPosts(); 
    })
    .catch((error)=>{
        const message = (error.response && error.response.data) ? error.response.data.message : "Post not found or already deleted";
        showAlert(message, "danger");
    });
}
function editPostBtnClicked(postObjsct){
    let post=JSON.parse(decodeURIComponent(postObjsct));
    console.log(post)
    // return
    document.getElementById("post-modal-submit-btn").innerHTML="Update"
    document.getElementById("post-input-id").value=post.id;
    document.getElementById("post-modal-title").innerText="Edit Post";
    document.getElementById("post-title-input").value=post.title;
    document.getElementById("post-body-input").value=post.body;
    let postModal=new bootstrap.Modal(document.getElementById("create-post-modal"),{});
    postModal.toggle();

}

function deletePostBtnClicked(postObjsct){
    let post=JSON.parse(decodeURIComponent(postObjsct));
    document.getElementById("delete-post-id-input").value=post.id;
    // console.log(post)
    // alert("delete")
    // return
    // document.getElementById("post-modal-submit-btn").innerHTML="Update"
    // document.getElementById("post-input-id").value=post.id;
    // document.getElementById("post-modal-title").innerText="Edit Post";
    // document.getElementById("post-title-input").value=post.title;
    // document.getElementById("post-body-input").value=post.body;
    let postModal=new bootstrap.Modal(document.getElementById("delete-post-modal"),{});
    postModal.toggle();

}


function createNewPostClicked(){
    let postId=document.getElementById("post-input-id").value;
    // alert(postId)
    let isCreate= postId==null || postId=="";
    // alert(isCreate)

    
    const title= document.getElementById("post-title-input").value;
    const body= document.getElementById("post-body-input").value;
    const image= document.getElementById("post-image-input").files[0];
    const token=localStorage.getItem("token")


    let formData=new FormData();
    formData.append("body",body);
    formData.append("title",title);
    formData.append("image",image);
    
    let url=``;
    const headers={
        "Content-Type":"multipart/form-data",
        "Authorization":`Bearer ${token}`
    }
      
    //  for choose edit or create
    if(isCreate){
        url=`${baseUrl}/posts`;
        toggleLoader(true);
        axios.post(url,formData,{
        headers:headers
    })
        .then((response)=>{
            const modal=document.getElementById("create-post-modal");
            const modalInstance=bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            showAlert("New Post Has Been Created","success");
            getPosts();
        })
        .catch((error)=>{
            const message=error.response.data.message;
            showAlert(message,"danger");
        }).finally(()=>{
            toggleLoader(false);
        })
    }else{
        formData.append("_method","put");
        url=`${baseUrl}/posts/${postId}`;
        toggleLoader(true);  
        axios.post(url,formData,{
        headers:headers
        })
        .then((response)=>{
            const modal=document.getElementById("create-post-modal");
            const modalInstance=bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            showAlert("Post Has Been Updated","success");
            getPosts();
        })
        .catch((error)=>{
            const message=error.response.data.message;
            showAlert(message,"danger");
        }).finally(()=>{
            toggleLoader(false);
        })
    }      
        }

function profileClick(){
    const user=getCurrentUser();
    const userId=user.id;
    window.location=`profile.html?userid=${userId}`
}



// ********************

 // هون شكلنا غرض فيه معلومات احدها رقم البوست المطلوب
    const urlParams=new URLSearchParams(window.location.search);
    // id من الرابط و نقدر نستخدمه من شان نستخرج ال
    const id=urlParams.get("postId");
    
    setupUI();    
    getPost();
    // let postTitle="";
    // if(post.title!=null){
    //     postTitle=post.title;
    // }

    function getPost(){
        // const baseUrl="https://tarmeezacademy.com/api/v1";
        axios.get(`${baseUrl}/posts/${id}`)
        .then((response)=>{
            const post=response.data.data;
            const comments=post.comments;
            const author=post.author;
            document.getElementById("username-span").innerHTML=author.username;
            // التعبئة الديناميكية لمحتوى البوست المختار لرؤية تفاصيله
            let commentsContent=``
             for(comment of comments){
              commentsContent+=`
                <div class="p-3" style="background-color: rgb(187,187,187);">
                    <div>
                        <img src=${comment.author.profile_image} alt="" style="width:40px;height:40px;" class="rounded-circle border border-2">
                        <b>${comment.author.username}</b>
                    </div>
                    <div>
                       ${comment.body}
                    </div>
                    
                </div>
            `}
            const postContent=`
            <div class="card shadow">
                <div class="card-header">
                    <!-- image of user -->
                    <img src=${author.profile_image} alt="" style="width:40px;height:40px;" class="rounded-circle border border-2">
                        <!-- user name -->
                        <b>@${author.username}</b>
                </div>
                <div class="card-body">
                    <img class="w-100" src=${post.image} alt="">
                    <!-- for the passed time -->
                        <h6 style="color:rgb(193,193,193)" class="mt-1">
                        ${post.created_at}
                    </h6>
                    <!-- for title -->
                    <h5>
                        ${post.title}
                    </h5>
                    <!-- for content of post -->
                        <p>${post.body}</p>
                    </p>
                    <hr>
                    <!-- for comments -->
                        <div>
                        <!-- for pen icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                            <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                        </svg>
                        <span>
                            ${post.comments_count} Comments
                        </span>
                        </div>
                </div>
                <div id="comments">
                  ${commentsContent}
                </div>
                <div class="input-group mb-3" id="add-comment-div">
                        <input id="comment-input" type="text" placeholder="Add Your Comment..." class="form-control" aria-label="Recipient's username" aria-describedby="button-addon2">
                        <button class="btn btn-outline-primary" onClick="createCommentClicked()">Send</button>
                </div>
            </div>`
            // وضع المحتوى الديناميكي في مكان المخصص لعرض البوست
             document.getElementById("post").innerHTML=postContent;
        })
    } 

    function createCommentClicked(){
        let commentBody=document.getElementById("comment-input").value;
        let params={
            "body":commentBody
        }
        let token=localStorage.getItem("token");
        let url=`${baseUrl}/posts/${id}/comments`;
        axios.post(url,params,{
            headers:{
                "Authorization":`Bearer ${token}`
            }
        })
        .then((response)=>{
            console.log(response);
            showAlert("The comment has been added successfully","success");
            getPost();
        })
         .catch((error)=>{
            if(error.response) {
                const message=error.response.data.message;
                showAlert(message,"danger");
            }
            
        });
    }