document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm && registerForm) {
        const loginUsernameInput = document.getElementById('login-username');
        const loginPasswordInput = document.getElementById('login-password');
        const loginErrorMessage = document.getElementById('login-error-message');
        
        const registerUsernameInput = document.getElementById('register-username');
        const registerPasswordInput = document.getElementById('register-password');
        const registerErrorMessage = document.getElementById('register-error-message');
        
        document.querySelectorAll('.toggle-link').forEach(link => {
            link.addEventListener('click', (event) => {
                const targetId = event.target.dataset.target;
                document.querySelectorAll('.form-group').forEach(group => {
                    group.classList.remove('active');
                });
                document.getElementById(targetId).classList.add('active');
                
                loginErrorMessage.style.visibility = 'hidden';
                registerErrorMessage.style.visibility = 'hidden';
                loginPasswordInput.value = '';
                registerPasswordInput.value = '';
            });
        });

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const username = loginUsernameInput.value.trim();
            const password = loginPasswordInput.value.trim();
            
            loginErrorMessage.style.visibility = 'hidden';

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('isLoggedIn', 'true'); 
                    localStorage.setItem('loggedInUser', data.username);
                    window.location.href = 'index.html'; 
                    
                } else {
                    loginErrorMessage.textContent = data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
                    loginErrorMessage.style.visibility = 'visible';
                    loginPasswordInput.value = '';
                }
            } catch (error) {
                console.error('Login error:', error);
                loginErrorMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
                loginErrorMessage.style.visibility = 'visible';
            }
        });
        
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const username = registerUsernameInput.value.trim();
            const password = registerPasswordInput.value.trim();
            
            registerErrorMessage.style.visibility = 'hidden';
            
            if (password.length < 6) {
                registerErrorMessage.textContent = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
                registerErrorMessage.style.visibility = 'visible';
                return;
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.status === 201) {
                    // ลงทะเบียนสำเร็จ
                    alert(`ลงทะเบียน ${data.user.username} สำเร็จ! กรุณาเข้าสู่ระบบ`);
                    
                    // สลับกลับไปหน้า Login และกรอกชื่อผู้ใช้ให้เลย
                    document.getElementById('register-group').classList.remove('active');
                    document.getElementById('login-group').classList.add('active');
                    loginUsernameInput.value = username; // ใช้ loginUsernameInput ที่ถูกประกาศด้านบน
                    registerPasswordInput.value = ''; 
                    
                } else {
                    // ลงทะเบียนไม่สำเร็จ
                    registerErrorMessage.textContent = data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน';
                    registerErrorMessage.style.visibility = 'visible';
                    registerPasswordInput.value = '';
                }
            } catch (error) {
                console.error('Register error:', error);
                registerErrorMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
                registerErrorMessage.style.visibility = 'visible';
            }
        });
    }

    const feedContainer = document.getElementById('feed-container');
    const loggedInUser = localStorage.getItem('loggedInUser') || 'GuestUser';
 
    if (feedContainer) {
        
        const postModal = document.getElementById('post-modal');
        const newPostBtn = document.getElementById('new-post-btn');
        const postCloseBtn = document.querySelector('.post-close-btn');
        const newPostForm = document.getElementById('new-post-form');
        const postErrorMessage = document.getElementById('post-error-message');
        
        const profileModal = document.getElementById('profile-modal');
        const profileBtn = document.getElementById('profile-btn');
        const profileCloseBtn = document.querySelector('.profile-close-btn');
        const profileUsernameDisplay = document.getElementById('profile-username-display');
        const currentLoggedInUser = document.getElementById('current-logged-in-user');
        const modalLogoutButton = document.getElementById('modal-logout-button');
        const logoutButton = document.getElementById('logout-button'); // ปุ่ม logout บน navbar

        // Logout function
        const handleLogout = () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUser'); 
            window.location.href = 'login.html';
        };

        profileBtn.addEventListener('click', () => {
            profileUsernameDisplay.textContent = loggedInUser;
            currentLoggedInUser.textContent = loggedInUser;

            const profileAvatar = document.querySelector('#profile-modal .profile-avatar');
            profileAvatar.textContent = loggedInUser.charAt(0).toUpperCase();

            profileModal.style.display = 'block';
        });

        profileCloseBtn.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });
        
        modalLogoutButton.addEventListener('click', handleLogout);
        logoutButton.addEventListener('click', handleLogout); // ปุ่ม logout บน navbar

        newPostBtn.addEventListener('click', () => {
            postModal.style.display = 'block';
            postErrorMessage.style.visibility = 'hidden';
            newPostForm.reset(); 
        });

        postCloseBtn.addEventListener('click', () => {
            postModal.style.display = 'none';
            newPostForm.reset(); 
        });

        window.addEventListener('click', (event) => {
            if (event.target === postModal) {
                postModal.style.display = 'none';
                newPostForm.reset();
            }
            if (event.target === profileModal) {
                profileModal.style.display = 'none';
            }
        });
        
        newPostForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const content = document.getElementById('post-content').value.trim();        
            if (!content) {
                postErrorMessage.textContent = 'กรุณาพิมพ์ข้อความเพื่อโพสต์';
                postErrorMessage.style.visibility = 'visible';
                return;
            }

            try {
                const response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: loggedInUser, 
                        content
                    }), // ลบ image: null
                });

                if (response.ok) {
                    postModal.style.display = 'none';
                    newPostForm.reset();
                    await renderFeed(); 
                } else {
                    const errorData = await response.json();
                    postErrorMessage.textContent = errorData.error || 'ไม่สามารถสร้างโพสต์ได้';
                    postErrorMessage.style.visibility = 'visible';
                }
            } catch (error) {
                console.error('Create post error:', error);
                postErrorMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Server';
                postErrorMessage.style.visibility = 'visible';
            }
        });
        
        const timeAgo = (dateString) => {
            const now = new Date();
            const past = new Date(dateString);
            if (isNaN(past.getTime())) return 'Now'; 
            
            const diffMs = now - past;
            const diffMins = Math.round(diffMs / (1000 * 60));
            if (diffMins < 60) return `${diffMins}m`;
            const diffHours = Math.round(diffMs / (1000 * 60 * 60));
            if (diffHours < 24) return `${diffHours}h`;
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
            return `${diffDays}d`;
        };
      
        const createPostCard = (post) => {
            const postElement = document.createElement('div');
            postElement.className = 'post-card';
            postElement.dataset.postId = post.id;
            
            // **เพิ่ม data attribute เพื่อเก็บจำนวน Like/Retweet ปัจจุบัน**
            postElement.dataset.likes = post.likes; 
            postElement.dataset.retweets = post.retweetCount; 
            
            const firstLetter = post.username.charAt(0).toUpperCase();
            const header = `
                <div class="post-header">
                    <div class="avatar-with-letter">${firstLetter}</div>
                    <div>
                        <span class="username">${post.username}</span>
                        <span class="timestamp">${timeAgo(post.createdAt)}</span>
                    </div>
                </div>
            `;

            let contentHTML = `<p class="post-content">${post.content}</p>`;

            const actions = `
                <div class="post-actions">
                    <i class="far fa-heart like-icon" title="ถูกใจ" data-post-id="${post.id}"></i> 
                    <i class="far fa-comment comment-icon" title="ตอบกลับ" data-post-id="${post.id}"></i>
                    <i class="fas fa-retweet retweet-icon" title="รีโพสต์" data-post-id="${post.id}"></i> 
                    
                </div>
            `;
            
            // **แสดงผล Likes และ Retweets จากข้อมูลที่ดึงมา**
            const stats = `
                <div class="post-stats">
                    <span class="like-count-text">ถูกใจ ${post.likes.toLocaleString()} ครั้ง</span>
                    <span class="separator"> • </span>
                    <span class="comment-count-text">ดู ${post.Comments.length} ความคิดเห็น</span>
                    <span class="separator"> • </span>
                    <span class="retweet-count-text">${post.retweetCount.toLocaleString()} รีโพสต์</span>
                </div>
            `;

            let commentsHTML = `<div class="comment-list" style="padding: 0 15px; margin-top: 5px;">`;
            post.Comments.forEach(comment => {
                commentsHTML += `
                    <div class="comment-item" style="margin-bottom: 3px; font-size: 0.9em;">
                        <span style="font-weight: 600;">${comment.commenter}</span> ${comment.commentText} 
                        <span style="color: #8e8e8e; font-size: 0.85em;">(${timeAgo(comment.createdAt)})</span>
                    </div>
                `;
            });
            commentsHTML += `</div>`;
            
            const commentForm = `
                <form class="comment-form" data-post-id="${post.id}" style="padding: 10px 15px 0 15px;">
                    <input type="text" name="commentText" placeholder="เพิ่มความคิดเห็นโดย ${loggedInUser}..." required style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="hidden" name="commenter" value="${loggedInUser}"> 
                    <button type="submit" style="display: none;">ส่ง</button>
                </form>
            `;


            postElement.innerHTML = header + contentHTML + actions + stats + commentsHTML + commentForm;
            return postElement;
        };

        const renderFeed = async () => {
            feedContainer.innerHTML = '<p class="loading-message">กำลังโหลดฟีด...</p>';
            
            try {
                const response = await fetch('/api/posts');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const posts = await response.json();

                feedContainer.innerHTML = ''; 
                
                posts.forEach(post => {
                    const postCard = createPostCard(post);
                    feedContainer.appendChild(postCard);
                });

                attachEventListeners();

            } catch (error) {
                feedContainer.innerHTML = `<p class="error-message">ไม่สามารถโหลดฟีดได้(${error.message})</p>`;
            }
        };
       
        const attachEventListeners = () => {
            document.querySelectorAll('.comment-form').forEach(form => {
                form.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const postId = form.dataset.postId;
                    const commentInput = form.querySelector('input[name="commentText"]');
                    const commenterInput = form.querySelector('input[name="commenter"]');

                    const commentText = commentInput.value;
                    const commenter = commenterInput.value;
                    
                    try {
                        const response = await fetch(`/api/posts/${postId}/comments`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ commenter, commentText }),
                        });

                        if (response.ok) {
                            commentInput.value = ''; 
                            await renderFeed(); 
                        } else {
                            const errorData = await response.json();
                            alert('เกิดข้อผิดพลาดในการ Comment: ' + (errorData.error || 'Server Error'));
                        }
                    } catch (error) {
                        console.error('Submit comment error:', error);
                        alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Server');
                    }
                });
            });
            
            // **LIKE Event Listener (Real-time Update)**
            document.querySelectorAll('.post-actions .like-icon').forEach(icon => {
                icon.addEventListener('click', async (event) => {
                    const target = event.target;
                    const postCard = target.closest('.post-card');
                    const postId = postCard.dataset.postId;
                    
                    const isLiked = target.classList.contains('fas');
                    const action = isLiked ? 'unlike' : 'like';

                    // Optimistic UI Update: เปลี่ยน UI ทันที
                    target.classList.toggle('far');
                    target.classList.toggle('fas');
                    target.style.color = target.classList.contains('fas') ? '#fa383e' : '#4a4a4a';
                    
                    try {
                        const response = await fetch(`/api/posts/${postId}/like`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action }), 
                        });

                        const data = await response.json();

                        if (response.ok && data.success) {
                            // Update Likes Count in UI from Server Response
                            const newLikes = data.newLikes; 
                            const likeCountTextElement = postCard.querySelector('.post-stats .like-count-text');
                            
                            likeCountTextElement.textContent = `ถูกใจ ${newLikes.toLocaleString()} ครั้ง`;
                            postCard.dataset.likes = newLikes;
                        } else {
                            // Revert UI change if server request fails
                            target.classList.toggle('far');
                            target.classList.toggle('fas');
                            target.style.color = isLiked ? '#fa383e' : '#4a4a4a'; // Revert color
                            console.error('Failed to update like on server:', data.error);
                        }
                    } catch (error) {
                        // Revert UI change if network error occurs
                        target.classList.toggle('far');
                        target.classList.toggle('fas');
                        target.style.color = isLiked ? '#fa383e' : '#4a4a4a'; // Revert color
                        console.error('Network error during like operation:', error);
                    }
                });
            });

            // **Retweet Event Listener (Real-time Update)**
            document.querySelectorAll('.post-actions .retweet-icon').forEach(icon => {
                const activeColor = '#17bf63';
                const defaultColor = '#4a4a4a';
                
                // Initialize color and state (โค้ดเดิม)
                icon.style.color = defaultColor; 
                icon.dataset.retweeted = 'false'; 

                icon.addEventListener('click', async (event) => {
                    const target = event.target;
                    const postCard = target.closest('.post-card');
                    const postId = postCard.dataset.postId;
                    
                    const isRetweeted = target.dataset.retweeted === 'true';
                    const newRetweetState = !isRetweeted;
                    const action = newRetweetState ? 'retweet' : 'unretweet';
                    
                    // Optimistic UI Update: เปลี่ยน UI ทันที
                    target.style.color = newRetweetState ? activeColor : defaultColor;
                    target.dataset.retweeted = newRetweetState.toString();

                    let currentRetweets = parseInt(postCard.dataset.retweets);
                    
                    try {
                        const response = await fetch(`/api/posts/${postId}/retweet`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action }), 
                        });

                        const data = await response.json();

                        if (response.ok && data.success) {
                            // Update Retweet Count in UI from Server Response
                            const newRetweets = data.newRetweets;
                            const retweetCountTextElement = postCard.querySelector('.post-stats .retweet-count-text');
                            
                            retweetCountTextElement.textContent = `${newRetweets.toLocaleString()} รีโพสต์`;
                            postCard.dataset.retweets = newRetweets;
                        } else {
                             // Revert UI change if server request fails
                            target.style.color = isRetweeted ? activeColor : defaultColor;
                            target.dataset.retweeted = isRetweeted.toString();
                            console.error('Failed to update retweet on server:', data.error);
                        }
                        
                    } catch (error) {
                        // Revert UI change if network error occurs
                        target.style.color = isRetweeted ? activeColor : defaultColor;
                        target.dataset.retweeted = isRetweeted.toString();
                        console.error('Network error during retweet operation:', error);
                    }
                });
            });
        };
        
        renderFeed();
    }
});