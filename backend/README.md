# Task Manager Serverless Backend

Backend serverless cho ứng dụng Task Manager deploy thủ công lên AWS Lambda, API Gateway, DynamoDB và Cognito.

## Stack

- API Gateway REST API
- 4 Lambda functions riêng biệt
- Node.js 20.x
- AWS SDK v3
- DynamoDB `TasksTable`
- GSI `userId-index`
- Cognito JWT Authentication
- API Gateway Cognito Authorizer
- Lambda trong VPC private subnet
- DynamoDB Gateway VPC Endpoint
- Không dùng NAT Gateway
- CORS chỉ cho phép CloudFront domain

## Structure

```txt
task-manager-serverless-backend/
├── package.json
├── README.md
├── src/
│   ├── shared/
│   ├── getTasks/
│   ├── createTask/
│   ├── updateTask/
│   └── deleteTask/
└── events/
```

## Build package

```bash
npm install
npm run package
```

File zip để upload lên Lambda:

```txt
dist/task-manager-backend.zip
```

File zip cần có đủ `package.json`, `src/` và `node_modules/` vì project dùng ES module và AWS SDK v3.

## AWS setup

### DynamoDB

Tạo table:

```txt
Table name: TasksTable
Partition key: taskId
Partition key type: String
Billing mode: On-demand
```

Tạo Global Secondary Index:

```txt
Index name: userId-index
Partition key: userId
Partition key type: String
Projection: All
```

### Lambda

Tạo 4 Lambda functions với runtime `Node.js 20.x`, upload cùng file zip `dist/task-manager-backend.zip`.

Handlers:

```txt
GetTasksFunction     src/getTasks/index.handler
CreateTaskFunction  src/createTask/index.handler
UpdateTaskFunction  src/updateTask/index.handler
DeleteTaskFunction  src/deleteTask/index.handler
```

Environment variables cho cả 4 Lambda:

```txt
TASKS_TABLE_NAME=TasksTable
USER_ID_INDEX_NAME=userId-index
ALLOWED_ORIGIN=https://your-cloudfront-domain.cloudfront.net
```

IAM role của Lambda cần quyền DynamoDB phù hợp:

```txt
dynamodb:GetItem
dynamodb:PutItem
dynamodb:UpdateItem
dynamodb:DeleteItem
dynamodb:Query
```

Resources cần cấp quyền:

```txt
arn:aws:dynamodb:<region>:<account-id>:table/TasksTable
arn:aws:dynamodb:<region>:<account-id>:table/TasksTable/index/userId-index
```

Nếu Lambda chạy trong private subnet, cần cấu hình VPC cho Lambda và tạo DynamoDB Gateway VPC Endpoint cho route table của private subnets.

### API Gateway

Tạo REST API và map routes:

```txt
GET     /tasks       -> GetTasksFunction
POST    /tasks       -> CreateTaskFunction
PUT     /tasks/{id}  -> UpdateTaskFunction
DELETE  /tasks/{id}  -> DeleteTaskFunction
```

Tạo Cognito Authorizer cho API Gateway và gắn vào các routes trên. Code đang đọc user từ Cognito claims trong:

```txt
event.requestContext.authorizer.claims
```

Bật CORS cho origin CloudFront của frontend:

```txt
Access-Control-Allow-Origin: https://your-cloudfront-domain.cloudfront.net
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
```

## Endpoints

```txt
GET    /tasks
POST   /tasks
PUT    /tasks/{id}
DELETE /tasks/{id}
```

Header:

```txt
Authorization: Bearer <jwt_token>
```
