// login.js (จัดการการสลับฟอร์มและ Login API)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const errorMessage = document.getElementById('login-error-message');
    
    // Logic สำหรับสลับฟอร์ม
    document.querySelectorAll('.toggle-link').forEach(link => {
        link.addEventListener('click', (event) => {
            const targetId = event.target.dataset.target;
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
            
            // ล้างข้อความผิดพลาดและช่องกรอกเมื่อสลับฟอร์ม
            errorMessage.style.visibility = 'hidden';
            document.getElementById('register-error-message').style.visibility = 'hidden';
            loginPasswordInput.value = '';
            const regPasswordInput = document.getElementById('register-password');
            if (regPasswordInput) regPasswordInput.value = '';
        });
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();
        
        errorMessage.style.visibility = 'hidden';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // **ล็อกอินสำเร็จ**
                localStorage.setItem('isLoggedIn', 'true'); 
                localStorage.setItem('loggedInUser', data.username);
                window.location.href = 'index.html'; 
                
            } else {
                // **ล็อกอินไม่สำเร็จ**
                errorMessage.textContent = data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
                errorMessage.style.visibility = 'visible';
                loginPasswordInput.value = ''; // ล้างรหัสผ่าน
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
            errorMessage.style.visibility = 'visible';
        }
    });
});