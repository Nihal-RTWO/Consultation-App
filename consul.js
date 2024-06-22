import promptSync from 'prompt-sync';

const prompt = promptSync();

const id = prompt('Press 1 for Admin or 2 for Doctor: ');
const username = prompt('Enter username: ');
const password = prompt('Enter password: ');

if (id === '1') {
    
    const correctAdminUsername = "admin";
    const correctAdminPassword = "admin@123";
    
    if (username === correctAdminUsername && password === correctAdminPassword) {
        console.log('Admin Login successful! Welcome to the system.');
    } else {
        console.log('Admin Login failed! Invalid username or password.');
    }
    
} else if (id === '2') {
 
    const correctUserUsername = "doctor";
    const correctUserPassword = "password";
    
    if (username === correctUserUsername && password === correctUserPassword) {
        console.log('Doctor Login successful! Welcome to the system.');
    } else {
        console.log('Doctor Login failed! Invalid username or password.');
    }

} else {
    console.log('Invalid selection! Please press 1 for Admin or 2 for User.');
}
