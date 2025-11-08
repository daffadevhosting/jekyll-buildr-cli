import axios from 'axios';
import { ConfigService } from './ConfigService';

interface CreateSiteResponse {
  structure: {
    name?: string;
    title?: string;
    description?: string;
    config?: any;
    layouts?: any[];
    includes?: any[];
    posts?: any[];
    pages?: any[];
    collections?: any;
    assets?: any;
  };
}

interface CreatePostResponse {
  content: string;
}

export class ApiService {
  static async createSite(prompt: string, options = {}): Promise<CreateSiteResponse> {
    const response = await axios.post(`${ConfigService.API_BASE_URL}/ai`, {
      prompt,
      options: {
        useTailwind: prompt.toLowerCase().includes('tailwind'),
        ...options
      }
    });
    return response.data as CreateSiteResponse;
  }

  static async createPost(title: string, tags: string[] = [], categories: string[] = []): Promise<CreatePostResponse> {
    const response = await axios.post(`${ConfigService.API_BASE_URL}/ai/generatePost`, {
      title,
      tags,
      categories
    });
    return response.data as CreatePostResponse;
  }

  static async checkHealth() {
    const response = await axios.get(`${ConfigService.API_BASE_URL}/health`);
    return response.data;
  }
}