const App = {
    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                // Acccounts now exposed
                web3.eth.sendTransaction({/* ... */})
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    init: async () => {
        App.list = document.getElementById('_list');
        App.form = document.getElementById('contents');
        App.submit = document.getElementById('add');
        
        await App.loadWeb3();

        let accounts = await web3.eth.getAccounts();
        web3.eth.defaultAccount = accounts[0]
        
        const response = await fetch('./contracts/TodoList.json');
        const contract = await response.json();
        App.contract = TruffleContract(contract);
        App.contract.setProvider(App.web3Provider);
        
        App.todoList = await App.contract.deployed();
        console.log(App.todoList);
        App.submit.addEventListener('click', e => {
            e.preventDefault();
            App.addTask();
        });
    },

    renderTasks: async () => {
        const taskCount = await App.todoList.taskCount();
        for (let i = 0; i < taskCount; i++) {
            const { content, id, isDone } = await App.todoList.tasks(i + 1);
            App.list.insertAdjacentHTML('beforeend', `
                <li>Number: ${id}, Content: ${content}, ${isDone ? 'Done' : 'Not done'}</li>
            `);
        }
    },

    addTask: async () => {
        let content = App.form.value;
        console.log(web3.eth.defaultAccount);
        await App.todoList.createTask(content);
        App.renderTasks();
    },

    render: async () => {
        App.renderTasks();
    }
};

window.addEventListener('DOMContentLoaded', async (event) => {
    await App.init();
    await App.render();
});