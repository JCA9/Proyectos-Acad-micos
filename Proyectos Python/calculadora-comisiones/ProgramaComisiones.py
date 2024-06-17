nombre=input("Ingrese su nombre:\n");

try:
    ventas=int(input("Ingrese las ventas que ha tenido: "));
    comision=(ventas*13)/100;
    print(f"OK {nombre}, este mes ganaste: {comision}");
except:
    print("No ingreso un numero")
