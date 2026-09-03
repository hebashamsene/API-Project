let currentPage=1;
let lastPage=1;

//  Infinite Scroll
window.addEventListener("scroll",function(){
    const endOfPage=window.innerHeight+window.pageYOffset>=document.body.scrollHeight;
    // اذا تحقق الشرط بيروح بيجيب دفعة البوسات التالية
    // المستخدم وصل لاخر الصفحة و انو في بوسات في الصفحة لم تعرض بعد
    if(endOfPage && currentPage<lastPage){
        // من شان ينتقل للصفحة التالية
        currentPage=currentPage+1;
        getPosts(false,currentPage);
    }
});

// call the function to setup the UI after the page is loaded
setupUI();
getPosts();
function userClicked(userId){
    window.location=`profile.html?userid=${userId}`
}

function getPosts(reload=true,page=1){
    // const baseUrl="https://tarmeezacademy.com/api/v1";
    toggleLoader(true);
    axios.get(`${baseUrl}/posts?limit=2&page=${page}`)
    .then((response)=>{
        toggleLoader(false);
        const posts=response.data.data;
        lastPage=response.data.meta.last_page;
        //    console.log(posts)
        // من شان حذف المحتوى التجريبي يلي حطيناه بالاول
        if(reload){
        document.getElementById("posts").innerHTML="";   
        }


        for(post of posts){
            // console.log(post)
            const author=post.author;
            // show or hide (edit) button
            let user=getCurrentUser();
            let isMyPost=user!=null && post.author.id==user.id;
            let editButtonContent=``
            if(isMyPost){
                editButtonContent=` <button class='btn btn-secondary' style="margin-left:5px; float:right" onClick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Edit</button>

                                    <button class='btn btn-danger' style="float:right" onClick="deletePostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Delete</button>`
            }
            // /تغير لتخزين العبارة الشرطية
            const postTitle = (post.title != null) ? post.title : " ";
            let content=`
                <div class="card shadow">
                    <div class="card-header">
                    <span onClick="userClicked(${author.id})" style="cursor:pointer;>
                            <!-- image of user -->
                            <img src="${author.profile_image}" alt="" style="width:40px;height:40px;" class="rounded-circle border border-2">
                                <!-- user name -->
                            <b>${author.username}</b>
                    </span> 
                        ${editButtonContent}
                    </div>
                    <div class="card-body" onClick="postClicked(${post.id})" style="cursor:pointer">
                        <img class="w-100" src="${post.image}" >
                        <!-- for the passed time -->
                            <h6 style="color:rgb(193,193,193)" class="mt-1">
                            ${post.created_at}
                        </h6>
                        <!-- for title -->
                        <h5>
                            ${postTitle}
                        </h5>
                        <!-- for content of post -->
                            <p>
                            ${post.body}
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
                                <span id="post-tags-${post.id}">
                                    
                                </span>
                            </span>
                            </div>
                    </div>
                </div>
            `

            document.getElementById("posts").innerHTML+=content;

            const  currentPostTagsId=`post-tags-${post.id}`
            document.getElementById(currentPostTagsId).innerHTML=""
            for(tag of post.tags){
                console.log(tag.name)
                let content= `
                    <button class="btn btn-sm rounded-5" style="background-color:gray;color:white">
                                ${tag.name}
                    </button>
                `
                document.getElementById(currentPostTagsId).innerHTML+=content
            }
        }
    })
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
        })
    }else{
        formData.append("_method","put");
        url=`${baseUrl}/posts/${postId}`;  
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
        })
    }      
        }

function postClicked(postId){
    // من شان نروح على صفحة تفاصيل البوست و نمرر رقم البوست في الرابط
window.location.href=`postDetails.html?postId=${postId}`;
}  


function addBtnClick(){

    document.getElementById("post-modal-submit-btn").innerHTML="Create"
    document.getElementById("post-input-id").value="";
    document.getElementById("post-modal-title").innerText="Create A New Post";
    document.getElementById("post-title-input").value="";
    document.getElementById("post-body-input").value="";
    let postModal=new bootstrap.Modal(document.getElementById("create-post-modal"),{});
    postModal.toggle();
}

// function confirmPostDelete(){
//         // alert("confirm")
//         const postId=document.getElementById("delete-post-id-input").value;
//         const url=`${baseUrl}/posts/${postId}`;
//         const token=localStorage.getItem("token")
//         const headers={
//         "Authorization":`Bearer ${token}`
//          }

//         axios.delete(url,{
//             headers:headers
//         })
//         .then((response)=>{
//             // console.log(response.data.token)
//             // localStorage.setItem("token",response.data.token);
//             // localStorage.setItem("user",JSON.stringify(response.data.user));
//             //  for close modal*
//             // fetch modal element by id
//             const modal=document.getElementById("delete-post-modal");
//             // convert the element for instance
//             const modalInstance= bootstrap.Modal.getInstance(modal);
//             modalInstance.hide();
//             showAlert("The Post Has Been Deleted successfully","success");
//             setupUI();
//         })
//         .catch((error)=>{
//             const message=error.response.data.message;
//             showAlert(message,"danger")
//         })
// }

function toggleLoader(show=true){
  if(show){
    document.getElementById("loader").style.visibility='visible'
  }else{
    document.getElementById("loader").style.visibility='hidden'
  }
}