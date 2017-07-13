/**
 * Created by MUHAMAD on 07/10/2017.
 */

export class Todo {
  text: string ;
  completed: boolean;
  creatorId?: string;
  completedAt?: number;
  todoId?: string;
  constructor(
    text: string ,
    completed: true ,
    creatorId?: string ,
    todoId?: string,
    completedAt?: number
     ) {
    this.text = text;
    this.creatorId = creatorId;
    this.completed = completed;
    this.todoId = todoId;
    this.completedAt = completedAt;
  }
}
