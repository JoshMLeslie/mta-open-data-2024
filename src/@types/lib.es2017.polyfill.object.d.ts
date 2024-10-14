interface ObjectConstructor {
	entries<K, V>(o: {[s: K]: V}): [K, V][];
}
