# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["iot-dashboard-backend.csproj", "./"]
RUN dotnet restore "iot-dashboard-backend.csproj"

# Copy full source code and build
COPY . .
RUN dotnet publish "iot-dashboard-backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# .NET 8 ใน Docker จะรัน HTTP บนพอร์ต 8080 เป็นค่าเริ่มต้น
EXPOSE 8080
ENTRYPOINT ["dotnet", "iot-dashboard-backend.dll"]