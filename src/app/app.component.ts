import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NacionalidadService } from './services/nacionalidad.service';
import { AlumnoService } from './services/alumno.service';

interface Sexos {
  name: string;
  code: boolean;
}

interface TiposDocumento {
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title:any = "evaluacion-web"
  Formulario!: FormGroup;
  alumnos: any[] = [];
  sexos: Sexos[] | undefined;
  tiposDocumento: TiposDocumento[] | undefined;
  nacionalidades: any[] = [];
  imagenSeleccionada: File | undefined;
  imagenSeleccionadaNueva: File | undefined;
  imagenBase64: string = "";
  imagenBase64Nueva: string = "";
  imagenUrl: string = "";
  visible: boolean = false;
  alumno: any ;

  constructor(private formBuilder: FormBuilder,
    private nacionalidadService: NacionalidadService,
    private alumnoService: AlumnoService) { }
  
  ngOnInit(): void {
    this.sexos = [
      { name: 'Masculino', code: true },
      { name: 'Femenino', code: false }
    ];

    this.tiposDocumento = [
      { name: 'DNI' },
      { name: 'RUC' }
    ];

    this.nacionalidades = [
      { name: 'Peruana' },
      { name: 'Chilena' }
    ];

    this.Formulario = this.formBuilder.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      telefono: ['', Validators.pattern('[0-9]*')],
      nacionalidad: ['', Validators.required]
    });

    this.obtenerPaises();
    this.obtenerAlumnos();
  }

  onSubmit(): void {
    const formulario = this.Formulario.value;
    if (this.Formulario.invalid) {
      alert("Revisa la información e intenta nuevamente.")
      return;
    }
    this.alumnoService.crearAlumno(formulario, this.imagenBase64).subscribe(
      response => {
         alert("Alumno creado correctamente.");
        this.obtenerAlumnos()
        this.Formulario.reset(); // Limpiar el formulario
        this.imagenBase64 = '';
        const imagen = document.getElementById('imagen') as HTMLInputElement;
        imagen.value = '';
      },
      error => {alert("Error al crear alumno.")} 
    );
  }

  obtenerPaises(): void {
    this.nacionalidadService.obtenerPaises().subscribe(data => {
      data.map(pais => {
        this.nacionalidades.push({ name: pais.name.common});
      });
      this.nacionalidades.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  obtenerAlumnos(): void {
    this.alumnos = [];
    this.alumnoService.obtenerAlumnos().subscribe(data => {
      data.forEach(async alumno => {
        try {
          const imagenUrl = await this.alumnoService.procesarImagenBase64(alumno.imagen);
          alumno.imagen = imagenUrl;
          this.alumnos.push(alumno);
        } catch (error) {
          console.error('Error al procesar la imagen para el alumno', alumno, error);
        }
      });
    });
  }

  onSeleccionarImagen(evento: any, nuevaImagen: boolean = false) {
    const imagenSeleccionada = evento.target.files[0];
    this.convertirImagenABase64(imagenSeleccionada, nuevaImagen);
  }
  
  convertirImagenABase64(imagen: File | undefined, nuevaImagen: boolean = false) {
    if (imagen) {
      const lector = new FileReader();
      lector.onload = () => {
        if (nuevaImagen) {
          this.imagenBase64Nueva = lector.result as string;
        } else {
          this.imagenBase64 = lector.result as string;
        }
      };
      lector.readAsDataURL(imagen);
    }
  }

  eliminarAlumno(alumno: any) {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este alumno?");
    if (confirmacion) {
      const datos = {
        numeroDocumento: alumno.numeroDocumento
      };
      console.log(datos);
      this.alumnoService.eliminarAlumno(datos).subscribe(
        response => { alert("Alumno eliminado correctamente."); this.obtenerAlumnos() },
        error => { alert("Error al eliminar alumno."); }
      );
    }
  }
  
  showDialog(alumno:any) {
    this.visible = true;
    this.alumno = alumno;
    console.log(this.alumno)
  }

  actualizarImagenAlumno(){
    const datos = {
      numeroDocumento: this.alumno.numeroDocumento,
      imagen: this.imagenBase64Nueva
    }
    console.log(datos);
    this.alumnoService.modificarAlumno(datos).subscribe(
      response => { alert("Alumno editado correctamente.");
      this.obtenerAlumnos();
      this.visible=false
      this.imagenBase64Nueva = '';
      const imagenNueva = document.getElementById('imagenNueva') as HTMLInputElement;
      imagenNueva.value = '';
    },
      error => {alert("Error al editado alumno.")} 
    );
  }

}
