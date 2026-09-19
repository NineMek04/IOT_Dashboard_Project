using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

var mongoDbSettings = builder.Configuration.GetSection("MongoDbSettings");
var connectionString = mongoDbSettings["ConnectionString"];

var mongoClient = new MongoClient(connectionString);
builder.Services.AddSingleton<IMongoClient>(mongoClient);

// 👉 เพิ่มการตั้งค่า CORS เปิดรับ Request จาก Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200") // พอร์ตของหน้าบ้าน
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 👉 เรียกใช้งาน CORS ก่อน Authorization
app.UseCors("AllowAngularApp");

app.UseAuthorization();
app.MapControllers();

app.Run();