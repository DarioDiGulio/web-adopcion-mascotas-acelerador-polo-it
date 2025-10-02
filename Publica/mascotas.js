async function mostrarMascotas() {
    const res = await fetch('https://misterio07.alwaysdata.net/mascotas' );
    console.log(res);
    
    mascotas= await res.json() 
    //const mascotas =data.payload || [];
    console.log(mascotas)

    const container = document.getElementById('container');
    container. innerHTML = '';
    
    mascotas.forEach((mascota)=> {
        console.log(mascotas)
        let clon = document.querySelector('template').content.cloneNode(true)
        clon.querySelector('img').setAttribute("src", mascota.thumbnail)
       clon.querySelector('h3').innerText = mascota.nombre;
clon.querySelectorAll('p')[0].innerText += mascota.tipo;
clon.querySelectorAll('p')[1].innerText += mascota.raza;
clon.querySelectorAll('p')[2].innerText += mascota.edad;
clon.querySelectorAll('p')[3].innerText += mascota.nombre;
clon.querySelectorAll('p')[4].innerText += mascota.direccion;
clon.querySelectorAll('p')[5].innerText += mascota.propietario;
        container.appendChild(clon)
        
    } )
   // console.log(mascotas)
   
}

mostrarMascotas()