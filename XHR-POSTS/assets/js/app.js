
let spinner = document.getElementById('spinner');
let postForm = document.getElementById('postForm');
let titleControl = document.getElementById('title');
let contentControl = document.getElementById('body');
let userIdControl = document.getElementById('userId');
let postContainer = document.getElementById('postContainer');

let addpostbtn = document.getElementById('addpostbtn');
let updatepostbtn = document.getElementById('updatepostbtn');

let BASE_URL = `https://jsonplaceholder.typicode.com`;
let POST_URL = `${BASE_URL}/posts`;


function showToast(message, iconType) {
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000
    });

    Toast.fire({
        icon: iconType,
        title: message
    });
}

function showSpinner() {
    spinner.classList.remove('d-none');
}
function hideSpinner() {
    spinner.classList.add('d-none');
}


function createCards(arr) {

    let result = '';

    for (let i = arr.length - 1; i >= 0; i--) {

        result += `
        <div class="col-md-4 mb-4" id="${arr[i].id}">
            <div class="card h-100">

                <div class="card-header">
                    <h4 class="text-center">${arr[i].title}</h4>
                </div>

                <div class="card-body mb-4">
                    <p>${arr[i].body}</p>
                    <p>User: ${arr[i].userId}</p>
                </div>

                <div class="card-footer d-flex justify-content-between">
                    <button onclick="onEdit(this)" class="btn btn-sm btn-outline-primary">EDIT</button>
                    <button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">REMOVE</button>
                </div>

            </div>
        </div>`;
    }

    postContainer.innerHTML = result;
}

function fetchData() {
    showSpinner();

    let xhr = new XMLHttpRequest();
    xhr.open('GET', POST_URL, true);

    xhr.onload = function () {
        hideSpinner();

        if (xhr.status >= 200 && xhr.status < 300) {
            let data = JSON.parse(xhr.response);
            createCards(data);
        } else {
            showToast('Failed to fetch data', 'error');
        }
    };

    xhr.send();
}


function onPostSubmit(eve) {
    eve.preventDefault();

    showSpinner();

    let postObj = {
        title: titleControl.value,
        body: contentControl.value,
        userId: userIdControl.value
    };

    let xhr = new XMLHttpRequest();
    xhr.open('POST', POST_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
        hideSpinner();

        if (xhr.status >= 200 && xhr.status < 300) {
            let res = JSON.parse(xhr.response);

            let col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            col.id = res.id;

            col.innerHTML = `
                <div class="card h-100">
                    <div class="card-header">
                        <h4 class="text-center">${postObj.title}</h4>
                    </div>
                    <div class="card-body">
                        <p>${postObj.body}</p>
                        <p>User: ${postObj.userId}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onclick="onEdit(this)" class="btn btn-sm btn-outline-primary">EDIT</button>
                        <button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">REMOVE</button>
                    </div>
                </div>
            `;

            postContainer.prepend(col);

            showToast('Post Added Successfully', 'success');
            postForm.reset();

        } else {
            showToast('Post Creation Failed', 'error');
        }
    };

    xhr.send(JSON.stringify(postObj));
}


function onEdit(ele) {

    showSpinner();

    let editId = ele.closest('.col-md-4').id;
    localStorage.setItem('EditId', editId);

    let url = `${BASE_URL}/posts/${editId}`;

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function () {
        hideSpinner();

        if (xhr.status >= 200 && xhr.status < 300) {

            let data = JSON.parse(xhr.response);

            titleControl.value = data.title;
            contentControl.value = data.body;
            userIdControl.value = data.userId;

            addpostbtn.classList.add('d-none');
            updatepostbtn.classList.remove('d-none');

            showToast('Post Loaded Successfully', 'success');

        } else {
            showToast('Failed to load post', 'error');
        }
    };

    xhr.send();
}

function onUpdate() {

    let updatedId = localStorage.getItem('EditId');

    if (!updatedId) {
        showToast('No post selected', 'warning');
        return;
    }

    showSpinner();

    let updatedObj = {
        title: titleControl.value,
        body: contentControl.value,
        userId: userIdControl.value,
        id: updatedId
    };
    console.log(updatedObj);

    let url = `${BASE_URL}/posts/${updatedId}`;

    let xhr = new XMLHttpRequest();
    xhr.open('PATCH', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {

        hideSpinner();

        if (xhr.status >= 200 && xhr.status < 300) {

            let col = document.getElementById(updatedId);

            col.querySelector('h4').innerText = updatedObj.title;
            col.querySelectorAll('p')[0].innerText = updatedObj.body;
            col.querySelectorAll('p')[1].innerText = "User: " + updatedObj.userId;

            localStorage.removeItem('EditId');

            addpostbtn.classList.remove('d-none');
            updatepostbtn.classList.add('d-none');

            postForm.reset();

            showToast('Post Updated Successfully', 'success');

        } else {
            showToast('Update Failed', 'error');
        }
    };

    xhr.send(JSON.stringify(updatedObj));
}

function onRemove(ele) {

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {

        if (result.isConfirmed) {

            let id = ele.closest('.col-md-4').id;
            let url = `${BASE_URL}/posts/${id}`;

            let xhr = new XMLHttpRequest();
            xhr.open('DELETE', url, true);

            xhr.onload = function () {

                if (xhr.status >= 200 && xhr.status < 300) {

                    ele.closest('.col-md-4').remove();
                    showToast('Post Deleted Successfully', 'success');

                } else {
                    showToast('Delete Failed', 'error');
                }
            };

            xhr.send();
        }
    });
}

// ================== EVENTS ==================
postForm.addEventListener('submit', onPostSubmit);
updatepostbtn.addEventListener('click', onUpdate);

// clear edit on refresh
window.onload = () => localStorage.removeItem('EditId');

// initial fetch
fetchData();