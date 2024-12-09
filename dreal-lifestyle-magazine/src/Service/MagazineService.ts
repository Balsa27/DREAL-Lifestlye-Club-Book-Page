import {BaseService} from "./BaseService.ts";

export class MagazineService extends BaseService {
    public async create(name: string) {
        return await this.request('/magazine', {
            method: 'POST',
            body: JSON.stringify({name})
        });
    }

    public async getAllUser() {
        try {
            const result = await this.request('/magazine', {
                method: 'GET'
            });
            return result;
        } catch (error) {
            throw error;
        }
    }

    public async delete(magazineId: string) {
        try {
            console.log()
            await this.request(`/magazine/${magazineId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Error deleting magazine:', error);
            throw error;
        }
    }

    async uploadPage(file: File, magazineId: string) {
        console.log("Upload details:", {
            file: {
                name: file.name,
                type: file.type,
                size: file.size
            },
            magazineId
        });

        const formData = new FormData();
        formData.append("File", file, file.name);
        formData.append("MagazineId", magazineId);

        const token = localStorage.getItem('jwt');
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await fetch(`${this.baseUrl}/magazine/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                redirect: 'follow'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload failed:', errorText);
                throw new Error(`Upload failed: ${response.status}`);
            }

            return response;
        } catch (err) {
            console.error('Upload error details:', err);
            throw err;
        }
    }

    async getMagazinePages(magazineId: string) {
        console.log('MAGAZIIiiiiiiiiiii', magazineId);
        
        const metadata = await this.request(`/magazine/${magazineId}/metadata`, {
            method: 'GET'
        });
        console.log(metadata);
        console.log(metadata);
        

        const obj = Object.keys(metadata).map(filename => ({
            id: filename,
            imageUrl: `${this.baseUrl}/magazine/${magazineId}/page/${filename}`,
            pageNumber: parseInt(filename.split('-').pop() || '0')
        })).sort((a, b) => a.pageNumber - b.pageNumber);
        
        console.log("Obj", obj)
        
        return obj;
    }
}