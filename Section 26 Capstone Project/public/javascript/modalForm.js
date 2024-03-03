document.addEventListener("DOMContentLoaded", function () {
    const postContent = document.getElementById('postContent');
    const wordCount = document.getElementById('wordCount');

    postContent.addEventListener('input', () => {
        const words = postContent.value.split(/\s+/).filter(Boolean);
        wordCount.textContent = `${words.length}/35 words`;
    });

    document.getElementById('createPostForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const words = postContent.value.split(/\s+/).filter(Boolean);
        if (words.length <= 35) {
            fetch('/create-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `post=${encodeURIComponent(postContent.value)}`,
            })
            .then(response => response.text())
            .then(() => window.location.reload())
            .catch(error => console.error('Error:', error));
        } else {
            alert("Please limit your post to 35 words.");
        }
    });

    // Event listeners for viewing posts
    document.querySelectorAll('.clickable-post').forEach(item => {
        item.addEventListener('click', function () {
            const postContent = this.getAttribute('data-post'); // Get the post content
            document.getElementById('viewPostContent').textContent = postContent; // Set the content in the modal
        });
    });

    // Event listeners for deleting posts
    document.querySelectorAll('.delete-post').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent triggering the click event of the post
            const postIndex = this.getAttribute('data-index');
            fetch(`/delete-post?postIndex=${postIndex}`, {
                method: 'GET',
            })
            .then(response => response.text())
            .then(() => window.location.reload())
            .catch(error => console.error('Error:', error));
        });
    });
});
