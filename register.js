// register.js (จัดการ Register API)
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const registerUsernameInput = document.getElementById('register-username');
    const registerPasswordInput = document.getElementById('register-password');
    const errorMessage = document.getElementById('register-error-message');
    
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const username = registerUsernameInput.value.trim();
        const password = registerPasswordInput.value.trim();
        
        errorMessage.style.visibility = 'hidden';
        
        if (password.length < 6) {
            errorMessage.textContent = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
            errorMessage.style.visibility = 'visible';
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
                // **ลงทะเบียนสำเร็จ**
                alert(`ลงทะเบียน ${data.user.username} สำเร็จ! กรุณาเข้าสู่ระบบ`);
                
                // สลับกลับไปหน้า Login และกรอกชื่อผู้ใช้ให้เลย
                document.getElementById('register-group').classList.remove('active');
                document.getElementById('login-group').classList.add('active');
                document.getElementById('login-username').value = username; 
                registerPasswordInput.value = ''; // ล้างรหัสผ่านในฟอร์มลงทะเบียน
                
            } else {
                // **ลงทะเบียนไม่สำเร็จ**
                errorMessage.textContent = data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน';
                errorMessage.style.visibility = 'visible';
                registerPasswordInput.value = '';
            }
        } catch (error) {
            console.error('Register error:', error);
            errorMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
            errorMessage.style.visibility = 'visible';
        }
    });
});