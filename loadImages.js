loadImages();

function createEl(htmlString = "", className) {
  const el = document.createElement(htmlString);
  if (className) {
    el.setAttribute("class", className);
  }
  return el;
}

function initLazyImages() {
  //vanilla js.  targets all 36 images tags on the page that has a class of lazy image and storing in a variable
  const lazyImages = document.querySelectorAll(".lazy-image");

  //this block of code will be called anytime any of the watched images passes into the intersection field, show up in the rectangle of our screen. get access to all the images that are currently intersecting or overlapping
  function onIntersection(imageEntities) {
    //and for each of those images we will loop thru
    imageEntities.forEach((image) => {
      //if the current image is intersecting,
      if (image.isIntersecting) {
        //we stop watching it, during this step we are going to set the source on the image, we are loading the image. if we have loaded the image, there is no need to watch that image and do it again later
        observer.unobserve(image.target);

        //setting the source attribute, initially the 1px(placeholder for all 36 images, and then the real images load in place of it, ) and override it and instead send it to the real image value.  only load the images as they intersect with viewport
        image.target.src = image.target.dataset.src;
      }
    });
  }

  //IntersectionObserver is built into all modern web browsers, calling it, watches the boundaries you specify, boundaries of your webpage, and it tells you anytime there is an intersection with one of your images, and as soon as that happens it will trigger this callback function(onIntersection)
  const observer = new IntersectionObserver(onIntersection);

  //lazyImages is an array of image references and for each image inside of that array, its going to watch it, have to teach our code to watch those images so that it can watch for the intersection of those images on the page.  boilerplate code.
  lazyImages.forEach((image) => observer.observe(image));
}

function loadImages() {
  //gets all the image from the database
  fetch("/api/images")
    //turn it into json
    .then((res) => res.json())
    //create a card for each image
    .then((data) => createCards(data))
    //initLazyImages is being called when the images are initially loaded, right as the page load
    .then(() => initLazyImages());
}

function createCards(data) {
  const container = document.querySelector(".container");
  container.innerHTML = "";
  let lastRow;
  const row = createEl("div", "row");

  return data.forEach(function (image, index) {
    const col = createEl("div", "col-md-4 mt-4");
    col.appendChild(createCard(image));
    if (index % 3 === 0) {
      row.appendChild(col);
      container.appendChild(row);
      lastRow = row;
    }

    return lastRow.appendChild(col);
  });
}

function createCard(image) {
  const card = createEl("div", "card");
  const imageContainer = createEl("div", "card__image-container");
  const img = createEl("img", "card-img-top card__image--cover lazy-image");
  //after you created the image, set the attribute, in this case we set it to src=to a 1px black image. the idea behind this you want to put a source on each of your images, but initially you want that source to be blank. initial source of our images but when the image scrolls on to the screen you replace this with the actual image.  if we want the inject the actual image eventually we have to hide it somewhere on here as an easter egg
  img.setAttribute(
    "src",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mOMrgcAATsA3BT31OAAAAAASUVORK5CYII="
  );
  //setting a data source, your holding place for the eventual image source, just a data attribute. hold on to the intended image pointer and only load it when the time is right,
  img.setAttribute("data-src", image.image);
  img.setAttribute("alt", image.description);

  const cardBody = createEl("div", "card-body");
  const ratingFormContainer = createEl(
    "div",
    "rating d-flex justify-content-start"
  );
  ratingFormContainer.setAttribute("data-id", image._id);
  ratingFormContainer.setAttribute("data-rating", image.rating);

  const ratingForm = createRatingForm(image);

  const cardText = createEl("p", "card-text font-weight-bold mt-2");

  cardText.innerText = `${image.description} (${image.rating})`;

  imageContainer.append(img);
  ratingFormContainer.append(ratingForm);
  cardBody.appendChild(ratingFormContainer);
  cardBody.appendChild(cardText);
  card.appendChild(imageContainer);
  card.appendChild(cardBody);

  return card;
}

function createRatingForm(image) {
  const labelText = {
    1: "One Star",
    2: "Two Stars",
    3: "Three Stars",
    4: "Four Stars",
    5: "Five Stars",
  };

  const form = createEl("form");
  form.setAttribute("action", "post");

  for (let i = 1; i <= 5; i++) {
    const input = createEl("input", "visuallyhidden");
    input.setAttribute("type", "radio");
    input.setAttribute("name", "rating");
    input.setAttribute("id", `${image._id}-star-${i}`);
    input.setAttribute("value", i);

    const label = createEl("label");
    label.setAttribute("for", `${image._id}-star-${i}`);
    const labelSpan = createEl("span", "visuallyhidden");
    labelSpan.innerText = labelText[i];
    const star = createEl("i", `fa-star ${image.rating >= i ? "fas" : "far"}`);

    label.appendChild(labelSpan);
    label.appendChild(star);
    label.onclick = updateRating;
    form.appendChild(input);
    form.appendChild(label);
  }

  return form;
}

function updateRating(event) {
  const [id, , rating] = event.currentTarget.getAttribute("for").split("-");
  fetch(`/api/images/${id}`, {
    method: "PUT",
    body: JSON.stringify({ rating }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(function () {
    loadImages();
  });
}
