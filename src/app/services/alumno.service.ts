import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private url_base = 'https://localhost:7293/api/Alumno/';
  private apiKey = 'evaluacion-api-pass';

  constructor(private http: HttpClient) { }

  crearAlumno(alumnoData: any, imagenBase64: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey
    });
    alumnoData.imagen = imagenBase64;
    return this.http.post(this.url_base, alumnoData, { headers });
  }

  modificarAlumno(alumnoData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey
    });
    return this.http.put(this.url_base, alumnoData, { headers });
  }

  eliminarAlumno(alumnoData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey
    });
    return this.http.post(this.url_base + 'Eliminar', alumnoData, { headers });
  }

  obtenerAlumnos(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey
    });

    return this.http.get<any[]>(this.url_base, { headers });
  }

  procesarImagenBase64(imagenBase64: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const byteCharacters = atob(imagenBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
  
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('No se pudo procesar la imagen'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error al procesar la imagen'));
      };
    });
  }
  
}
