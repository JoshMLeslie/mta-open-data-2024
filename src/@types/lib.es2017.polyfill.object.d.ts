interface ObjectConstructor {
	entries<K, V>(o: Record<K, V>): [K, V][];
}
