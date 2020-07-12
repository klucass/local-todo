// Deixa a variavel em escopo global para que possamos manipular-la
let db;
window.onload = function(){
    console.log("janela abriu")
    //Objeto que nos permnite manipular os dados
    let request = window.indexedDB.open('tarefas', 1);
    
    //Em caso de erro
    request.onerror = function(){console.log('Erro na abertura da base de dados');}

    //Em caso de sucesso
    request.onsuccess = function(){
        console.log('Base de dados aberta com sucesso');

        db = request.result;

        //
        listaTarefas();
    }
    request.onupgradeneeded = function(e){
        let db = e.target.result;

        let objectStore = db.createObjectStore('tarefas', 
        {keyPath: 'id', autoIncrement:true});
        objectStore.createIndex('nome', 'nome', {unique: false});
        
        console.log('Base de dados configurada com sucesso');
    }

}

function novaTarefa(){
    let tarefaNome = document.querySelector("input").value;           
  

    let tarefaNova = {nome: tarefaNome};
    let transaction = db.transaction(['tarefas'], 'readwrite');
    let objectStore = transaction.objectStore('tarefas');
    let request = objectStore.add(tarefaNova);
    request.onsuccess = function(){console.log('Tarefa adicionada com sucesso');}
    transaction.oncomplete = function(){
        console.log('Transação completa');
        listaTarefas();
    }
    transaction.onerror = function(){
        console.log('Erro na transação');
    }
    document.querySelector("form input").value = "";
    document.querySelector("form input").focus();

}

function listaTarefas(){
    let list = document.querySelector('ul');

    //Para evitar duplicação
    while (list.firstChild){list.removeChild(list.firstChild);}

    let objectStore = db.transaction('tarefas').objectStore('tarefas');

    objectStore.openCursor().onsuccess = function(e){
        let cursor = e.target.result;

        if(cursor){                    

            let html = `<li data-tarefa-id="${cursor.value.id}">${cursor.value.nome} 
                    <a href="#" onclick="removerTarefa(this.parentElement);">
                        <small>Remover</small>
                    </a>
                </li>`;
            list.insertAdjacentHTML("beforeend", html);

            cursor.continue();

        }
        else{console.log('Tarefas listadas');}
        
    }            

}
function removerTarefa(e){
    let tarefaId = Number(e.getAttribute('data-tarefa-id'));
    let transaction = db.transaction(['tarefas'], 'readwrite');
    let objectStore = transaction.objectStore('tarefas');
    let request = objectStore.delete(tarefaId);

    transaction.oncomplete = function() {
        
        e.parentNode.removeChild(e);
        console.log('Tarefa ' + tarefaId + ' apagada.');
    }
    document.querySelector("form input").focus();
    
}