function createElemWithText(elem="p", textContent="", className) {
  let element = document.createElement(elem);
  element.textContent = textContent;
  if (className) {
    element.classList.add(className);
  }
  return element;
}

function createSelectOptions(users) {
  if (users == undefined) return undefined;
  
  let option_elements = [];
  for (const user of users) {
    let option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.name;
    option_elements.push(option);
  }
  
  return option_elements;
}

function toggleCommentSection(postId) {
    if (postId == undefined) return undefined;

    const section = document.querySelector(`section[data-post-id='${postId}']`);

    if (section != undefined) {
        if (section.classList.contains("hide")) {
            section.classList.remove("hide");
        }
        else {
            section.classList.add("hide");
        }
    }

    return section;
}

function toggleCommentButton(postId) {
    if (postId == undefined) return undefined;

    const button = document.querySelector(`button[data-post-id='${postId}'`);

    if (button != undefined) {
        button.textContent = button.textContent == "Show Comments" ? "Hide Comments" : "Show Comments";
    }

    return button;
}

function deleteChildElements(parentElement) {
    if (parentElement == undefined || !(parentElement instanceof HTMLElement)) return undefined;

    let child = parentElement.lastElementChild;
    while(child != undefined) {
      parentElement.removeChild(child);
      child = parentElement.lastElementChild;
    }

    return parentElement;
}

function addButtonListeners() {
  const buttons = document.querySelectorAll("main button");
  if (buttons == undefined) return undefined;

  let selected_buttons = [];
  for (const button of buttons) {
    const post_id = button.dataset.postId;
    button.addEventListener("click", (event) => {
      toggleComments(event, post_id);
    });
    selected_buttons.push(button);
  }

  return selected_buttons;
}

function removeButtonListeners() {
  const buttons = document.querySelectorAll("main button");
  if (buttons == undefined) return undefined;

  let selected_buttons = [];
  for (const button of buttons) {
    const post_id = button.dataset.postId;
    button.removeEventListener("click", (event) => {
      toggleComments(event, post_id);
    });
    selected_buttons.push(button);
  }

  return selected_buttons;
}

function createComments(comments_data) {
  if (comments_data == undefined) return undefined;

  const fragment = document.createDocumentFragment()

  for (const comment of comments_data) {
    const article = document.createElement("article");
    const h3 = createElemWithText("h3", comment.name);
    const p1 = createElemWithText("p", comment.body);
    const p2 = createElemWithText("p", `From: ${comment.email}`);

    article.appendChild(h3);
    article.appendChild(p1);
    article.appendChild(p2);

    fragment.appendChild(article);
  }
  return fragment;
}

function populateSelectMenu(users) {
  if (users == undefined) return undefined;

  const selectMenu = document.querySelector("#selectMenu");
  const options = createSelectOptions(users);

  for (const option of options) {
    selectMenu.appendChild(option);
  }

  return selectMenu;
}

async function getUsers() {
  try {
    return await fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json());
  } catch(e) {
    return undefined;
  }
}

async function getUserPosts(userId) {
  if (userId == undefined) return undefined;

  try {
    return await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
      .then((response) => response.json());
  } catch(e) {
    return undefined;
  }
}

async function getUser(userId) {
  if (userId == undefined) return undefined;

  try {
    return await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then((response) => response.json());
  } catch(e) {
    return undefined;
  }
}

async function getPostComments(postId) {
  if (postId == undefined) return undefined;

  try {
    return await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
      .then((response) => response.json());
  } catch(e) {
    return undefined;
  }
}

async function displayComments(postId) {
  if (postId == undefined) return undefined;

  const section = document.createElement("section");
  section.dataset.postId = postId;
  section.classList.add("comments", "hide");
  const comments = await getPostComments(postId);
  const fragment = createComments(comments);
  section.append(fragment);

  return section;
}

async function createPosts(posts){
  if (posts == undefined) return undefined;

  const fragment = document.createDocumentFragment();
  for (const post of posts) {
    const article = document.createElement("article");

    const h2 = document.createElement("h2");
    h2.textContent = post.title;

    const p1 = document.createElement("p");
    p1.textContent = post.body;

    const p2 = document.createElement("p");
    p2.textContent = `Post ID: ${post.id}`

    const author = await getUser(post.userId);

    const p3 = document.createElement("p");
    p3.textContent = `Author: ${author.name} with ${author.company.name}`;

    const p4 = document.createElement("p");
    p4.textContent = `${author.company.catchPhrase}`;

    const button = document.createElement("button");
    button.textContent = "Show Comments";
    button.dataset.postId = post.id;

    const section = await displayComments(post.id);

    article.append(h2, p1, p2, p3, p4, button, section);

    fragment.append(article);
  }

  return fragment;
}

async function displayPosts(postsData) {
  const main = document.querySelector("main");

  let element = postsData != undefined ?
   await createPosts(postsData) : createElemWithText("p", "Select an Employee to display their posts.", "default-text");

  main.append(element);

  return element;
}

function toggleComments(e, postId) {
  if (e == undefined || postId == undefined) return undefined;

  e.target.listener = true;
  const section = toggleCommentSection(postId);
  const button = toggleCommentButton(postId);
  return [section, button];
}

async function refreshPosts(posts) {
  if (posts == undefined) return undefined; 
  
  const buttons = removeButtonListeners();  
  const main = deleteChildElements(document.querySelector("main"));
  const fragment = await displayPosts(posts);
  const addedButtons = addButtonListeners();

  return [buttons, main, fragment, addedButtons];
}

async function selectMenuChangeEventHandler(event) {
  if (event == undefined) return undefined;

  const selectMenu = document.getElementById("selectMenu");
  selectMenu.disabled = true;
  const userId = event.target.value || 1;
  const posts = await getUserPosts(userId);
  const refreshed = await refreshPosts(posts);
  selectMenu.disabled = false;

  return [userId, posts, refreshed];
}

async function initPage() {
  const users = await getUsers();
  const populated = populateSelectMenu(users);

  return [users, populated];
}

async function initApp(){
  const init = await initPage();
  const selectMenu = document.getElementById("selectMenu");
  selectMenu.addEventListener("change", selectMenuChangeEventHandler);
}

document.addEventListener("DOMContentLoaded", initApp);
