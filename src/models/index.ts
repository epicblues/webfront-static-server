export interface Recipe {
  post_no: number;
  user_id: string;
  upload_date: Date;
  title: string;
  desc: string;
  category: string;
  qtt: number; // 양
  duration: string;
  igr_array: Food[]; // 음식 객체의 배열
  steps: Step[];
  hit: number;
}

export interface Step {
  image_url: string;
  desc: string;
  image_data: string; // 실제 이미지 데이터 - base64기반 => decode해서 fileSystem에 저장하는 로직 필요.
}

export interface Food {}

export interface ImageFile {
  fieldName: string;
  originalFilename: string;
  path: string;
  headers: Object;
  size: number;
}

export interface Diary {
  _id: number;
  user_email: string;
  upload_date: Date;
  calorie_target: number;
  calorie_total: number;
  success: boolean;
  review: string;
}
export interface Ingredient {
  food_id: number;
  quantity: number;
}
