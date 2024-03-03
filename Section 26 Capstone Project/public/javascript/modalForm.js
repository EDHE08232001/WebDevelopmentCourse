document.addEventListener("DOMContentLoaded", function () {
    const postContent = document.getElementById('postContent');
    const wordCount = document.getElementById('wordCount');

    postContent.addEventListener('input', () => {
        const words = postContent.value.split(/\s+/).filter(Boolean); // Split by whitespace and remove empty strings
        wordCount.textContent = `${words.length}/35 words`;

        // Optionally, disable the submit button if the word count exceeds 35
        // document.querySelector('#createPostForm button[type="submit"]').disabled = words.length > 35;
    });

    document.getElementById('createPostForm').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission
        const words = postContent.value.split(/\s+/).filter(Boolean);
        if (words.length <= 35) {
            // Submit the form data
            fetch('/create-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `post=${encodeURIComponent(postContent.value)}`,
            })
                .then(response => response.text())
                .then(() => {
                    window.location.reload(); // Reload the page to update the list of posts
                })
                .catch(error => console.error('Error:', error));
        } else {
            alert("Please limit your post to 35 words.");
        }
    });
});